"""
client.py — Leaf Music Desktop Client v2.

Архитектура:
  - SPA (static/) грузится в QWebEngineView и общается с локальным
    api_adapter.py (Flask на 127.0.0.1:<случайный порт>).
  - Поиск и воспроизведение api_adapter.py делает сам (SoundCloud / yt-dlp).
  - Авторизация и плейлисты api_adapter.py проксирует через ServerClient
    (api_client.py) на удалённый шлюз server.py.
  - Монитор соединения пингует server.py; если сервер недоступен дольше
    RECONNECT_TIMEOUT_SEC — окно переключается на static/not-network.html
    (там показываются скачанные треки из localStorage). Как только связь
    восстановилась, окно возвращается на SPA.
"""
from __future__ import annotations

import logging
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("leaf_client.log", encoding="utf-8"),
    ],
)
log = logging.getLogger("leaf.client")

from PySide6.QtCore import Qt, QUrl, QThread, Signal, QTimer
from PySide6.QtGui import QIcon, QPixmap, QFont
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QLabel, QStackedWidget,
)
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebEngineCore import QWebEngineProfile
from PySide6.QtWebChannel import QWebChannel
from PySide6.QtNetwork import QNetworkCookie

from api_client import ServerClient
from bridge import ApiBridge
from api_adapter import LocalApiServer, set_server_client, set_online_status
import session_store

# ============================================================
# Конфигурация подключения к серверу
# ============================================================
SERVER_BASE_URL = os.environ.get("LEAF_SERVER_URL", "https://leafmusic.fun")

STATIC_DIR = Path(__file__).resolve().parent / "static"
NOT_NETWORK_PAGE = "not-network.html"

RECONNECT_TIMEOUT_SEC = 10
PING_INTERVAL_MS = 3000
RECONNECT_INTERVAL_MS = 1000


# ============================================================
# Background workers
# ============================================================

class ApiWorker(QThread):
    succeeded = Signal(object)
    failed = Signal(str, object)

    def __init__(self, fn, *args, **kwargs):
        super().__init__()
        self._fn = fn
        self._args = args
        self._kwargs = kwargs

    def run(self):
        try:
            result = self._fn(*self._args, **self._kwargs)
            self.succeeded.emit(result)
        except Exception as e:
            log.error("ApiWorker: %s", e)
            self.failed.emit(str(e), None)


def run_async(fn, on_success, on_error, *args, **kwargs):
    worker = ApiWorker(fn, *args, **kwargs)
    worker.succeeded.connect(on_success)
    worker.failed.connect(lambda msg, retry: on_error(msg, retry))
    worker.start()
    return worker


# ============================================================
# Connection Monitor
# ============================================================

class ConnectionMonitor(QThread):
    status_changed = Signal(bool)

    def __init__(self, server_client: ServerClient):
        super().__init__()
        self.server = server_client
        self._running = True
        self._online = False

    def run(self):
        while self._running:
            reachable = self.server.ping()
            if reachable != self._online:
                self._online = reachable
                self.status_changed.emit(reachable)
            interval = PING_INTERVAL_MS if reachable else RECONNECT_INTERVAL_MS
            for _ in range(interval // 100):
                if not self._running:
                    return
                self.msleep(100)

    def stop(self):
        self._running = False
        self.wait(2000)


# ============================================================
# Splash Window
# ============================================================

class SplashWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setFixedSize(400, 320)

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(8)

        icon_label = QLabel()
        icon_path = STATIC_DIR / "images" / "LeafGreen.png"
        if icon_path.exists():
            pixmap = QPixmap(str(icon_path))
            icon_label.setPixmap(
                pixmap.scaled(80, 80, Qt.AspectRatioMode.KeepAspectRatio,
                              Qt.TransformationMode.SmoothTransformation)
            )
        icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_label)

        name = QLabel("Leaf Music")
        name.setStyleSheet("color: white; font-size: 24px; font-weight: bold; background: transparent;")
        name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(name)

        self.status = QLabel("Подключение к серверу...")
        self.status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status.setStyleSheet("color: #aaa; font-size: 12px; background: transparent; margin-top: 8px;")
        layout.addWidget(self.status)

    def set_status(self, text: str):
        self.status.setText(text)


# ============================================================
# Offline Notification Bar (короткое уведомление на время переподключения)
# ============================================================

class OfflineBar(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedHeight(36)
        self.setStyleSheet(
            "background: #cc3333; color: white; font-size: 13px;"
            "padding: 0 16px; border-radius: 0;"
        )
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 0, 16, 0)
        self.label = QLabel("Переподключение к серверу...")
        self.label.setStyleSheet("color: white; background: transparent; border: none;")
        layout.addWidget(self.label)
        self.hide()

    def show_message(self, msg: str):
        self.label.setText(msg)
        self.show()
        self.raise_()


# ============================================================
# Auth Window
# ============================================================

class AuthWindow(QMainWindow):
    authenticated = Signal(dict)

    def __init__(self, server_client: ServerClient, static_base_url: str):
        super().__init__()
        self.setWindowTitle("Leaf — вход")
        self.resize(560, 780)

        self.bridge = ApiBridge(server_client)
        self.bridge.authCompleted.connect(self._on_authenticated)

        self.channel = QWebChannel()
        self.channel.registerObject("bridge", self.bridge)

        self.view = QWebEngineView()
        self.view.page().setWebChannel(self.channel)
        reg_url = f"{static_base_url}/reg.html"
        log.info("AuthWindow: loading %s", reg_url)
        self.view.load(QUrl(reg_url))
        self.setCentralWidget(self.view)

    def _on_authenticated(self, data: dict):
        user = data.get("user", data)
        log.info("AuthWindow: authenticated user=%s", user.get("login"))
        self.authenticated.emit(user)
        self.close()


# ============================================================
# Main Window
# ============================================================

class MainWindow(QMainWindow):
    def __init__(self, server_client: ServerClient, user: dict, adapter_url: str):
        super().__init__()
        self.server_client = server_client
        self.user = user
        self.adapter_url = adapter_url
        self.setWindowTitle(f"Leaf Music — {user.get('username') or user.get('login')}")
        self.resize(1280, 800)
        self.setMinimumSize(800, 600)

        self._is_online = True
        self._offline_since = 0.0
        self._showing_offline_page = False

        central = QWidget()
        self.setCentralWidget(central)
        self._layout = QVBoxLayout(central)
        self._layout.setContentsMargins(0, 0, 0, 0)
        self._layout.setSpacing(0)

        self.offline_bar = OfflineBar()
        self._layout.addWidget(self.offline_bar)

        self.web_view = QWebEngineView()
        self._layout.addWidget(self.web_view)

        self._sync_session_cookie()
        self.web_view.load(QUrl(adapter_url))

        self._network_timer = QTimer(self)
        self._network_timer.timeout.connect(self._check_network)
        self._network_timer.start(PING_INTERVAL_MS)

    def _sync_session_cookie(self):
        cookie_value = self.server_client.session_cookie_value()
        if not cookie_value:
            return
        parsed = urlparse(self.adapter_url)
        cookie = QNetworkCookie()
        cookie.setName(b"session")
        cookie.setValue(cookie_value.encode())
        cookie.setDomain(parsed.hostname or "127.0.0.1")
        cookie.setPath("/")
        self.web_view.page().profile().cookieStore().setCookie(cookie, QUrl(self.adapter_url))
        log.info("Session cookie synced to WebView")

    def set_online(self, online: bool):
        if online == self._is_online:
            return
        self._is_online = online
        set_online_status(online)

        if not online:
            self._offline_since = time.time()
            self.offline_bar.show_message("Переподключение к серверу...")
        else:
            self._offline_since = 0.0
            self.offline_bar.hide()
            if self._showing_offline_page:
                self._showing_offline_page = False
                log.info("Connection restored — возвращаемся в приложение")
                self.web_view.load(QUrl(self.adapter_url))

    def _check_network(self):
        # Быстрая перепроверка через частые пинги ConnectionMonitor'а уже идёт
        # в фоне; здесь только решаем, не пора ли показать not-network.html.
        if self._is_online or self._showing_offline_page:
            return
        elapsed = time.time() - self._offline_since
        if elapsed >= RECONNECT_TIMEOUT_SEC:
            self._showing_offline_page = True
            self.offline_bar.hide()
            offline_url = f"{self.adapter_url}/{NOT_NETWORK_PAGE}"
            log.info("Сервер недоступен дольше %ss — показываем %s", RECONNECT_TIMEOUT_SEC, offline_url)
            self.web_view.load(QUrl(offline_url))

    def closeEvent(self, event):
        self._network_timer.stop()
        event.accept()


# ============================================================
# Application Orchestrator
# ============================================================

class App:
    def __init__(self):
        self.server = ServerClient(SERVER_BASE_URL)
        set_server_client(self.server)
        set_online_status(True)

        self.auth_window = None
        self.main_window = None
        self.splash = None
        self._auth_worker = None
        self._local_server = None
        self._conn_monitor = None

    def start(self):
        log.info("App.start")
        self.splash = SplashWindow()
        self.splash.show()

        saved_cookie = session_store.load_session()
        if saved_cookie:
            self.server.restore_session_cookie(saved_cookie)
            log.info("Restoring saved session")
            self.splash.set_status("Проверка сессии...")
            self._auth_worker = run_async(
                self.server.me, self._on_me_ok, self._on_me_fail
            )
        else:
            self._close_splash()
            self._open_auth_window()

    def _close_splash(self):
        if self.splash:
            self.splash.close()
            self.splash.deleteLater()
            self.splash = None

    def _on_me_ok(self, user: dict):
        log.info("Session valid: %s", user.get("login"))
        fresh = self.server.session_cookie_value()
        if fresh:
            try:
                session_store.save_session(fresh)
            except Exception as e:
                log.warning("Could not refresh saved session: %s", e)
        self._close_splash()
        self._open_main_window(user)

    def _on_me_fail(self, msg, _):
        log.warning("Session invalid: %s", msg)
        if msg in ("not_authenticated", "banned"):
            session_store.clear_session()
        self._close_splash()
        self._open_auth_window()

    def _open_auth_window(self):
        self._ensure_local_server()
        self.auth_window = AuthWindow(self.server, self._local_server.base_url)
        self.auth_window.authenticated.connect(self._on_authenticated)
        self.auth_window.show()
        self.auth_window.activateWindow()
        self.auth_window.raise_()

    def _on_authenticated(self, user: dict):
        cookie = self.server.session_cookie_value()
        if cookie:
            session_store.save_session(cookie)
        self._open_main_window(user)

    def _open_main_window(self, user: dict):
        self._ensure_local_server()
        self.main_window = MainWindow(self.server, user, self._local_server.base_url)
        self._start_connection_monitor()
        self.main_window.show()

    def _ensure_local_server(self):
        if self._local_server is None:
            self._local_server = LocalApiServer()
            self._local_server.start()
            log.info("Local API server at %s", self._local_server.base_url)

    def _start_connection_monitor(self):
        if self._conn_monitor:
            return
        self._conn_monitor = ConnectionMonitor(self.server)
        self._conn_monitor.status_changed.connect(self._on_connection_changed)
        self._conn_monitor.start()
        log.info("Connection monitor started")

    def _on_connection_changed(self, online: bool):
        log.info("Connection status: %s", "ONLINE" if online else "OFFLINE")
        set_online_status(online)
        if self.main_window:
            self.main_window.set_online(online)


# ============================================================
# Entry point
# ============================================================

def main():
    log.info("=== Leaf Music Desktop v2 starting ===")
    log.info("Python %s", sys.version)
    log.info("SERVER_BASE_URL = %s", SERVER_BASE_URL)

    app = QApplication(sys.argv)
    app.setApplicationName("Leaf Music")
    app.setOrganizationName("LeafMusic")

    icon_path = STATIC_DIR / "images" / "favicon.ico"
    if icon_path.exists():
        app.setWindowIcon(QIcon(str(icon_path)))

    font = QFont("Inter", 10)
    app.setFont(font)

    leaf_app = App()
    leaf_app.start()

    log.info("Entering Qt event loop")
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())