"""
bridge.py — QWebChannel bridge for auth (register/login).

Runs API calls in background QThreads so UI stays responsive.
Emits results as JSON strings to the SPA via Qt signals.
"""
from __future__ import annotations

import json
import logging

from PySide6.QtCore import QObject, Signal, Slot, QThread

from api_client import ServerClient, ApiError

log = logging.getLogger("leaf.bridge")


class _Worker(QThread):
    done = Signal(str)

    def __init__(self, fn, args, extra_on_success: dict | None = None):
        super().__init__()
        self._fn = fn
        self._args = args
        self._extra = extra_on_success or {}

    def run(self):
        fn_name = getattr(self._fn, '__name__', str(self._fn))
        log.debug("Worker.start: %s", fn_name)
        try:
            payload = self._fn(*self._args)
            result = {"ok": True, **self._extra, **(payload or {})}
            log.debug("Worker.ok: %s", fn_name)
        except ApiError as e:
            result = {"ok": False, "message": e.message, "retry_after": e.retry_after}
            log.warning("Worker.ApiError: %s -> %s", fn_name, e.message)
        except Exception as e:
            result = {"ok": False, "message": str(e)}
            log.error("Worker.Exception: %s -> %s", fn_name, e)
        self.done.emit(json.dumps(result))


class ApiBridge(QObject):
    registerStep1Done = Signal(str)
    registerVerifyDone = Signal(str)
    registerResendDone = Signal(str)
    loginStep1Done = Signal(str)
    loginVerifyDone = Signal(str)
    loginResendDone = Signal(str)
    authCompleted = Signal(dict)

    def __init__(self, server_client: ServerClient):
        super().__init__()
        self.server = server_client
        self._workers: list[_Worker] = []

    def _launch(self, fn, args, done_signal):
        worker = _Worker(fn, args)
        worker.done.connect(done_signal.emit)
        worker.finished.connect(lambda: self._workers.remove(worker) if worker in self._workers else None)
        self._workers.append(worker)
        worker.start()

    @Slot(str, str, str, str, str, bool)
    def register(self, login, username, gmail, password, password_confirm, agree):
        log.info("bridge.register: login=%s gmail=%s", login, gmail)
        self._launch(
            self.server.register,
            (login, username, gmail, password, password_confirm, agree),
            self.registerStep1Done,
        )

    @Slot(str, str)
    def registerVerify(self, gmail, code):
        log.info("bridge.registerVerify: gmail=%s", gmail)

        def call_and_notify():
            result = self.server.register_verify(gmail, code)
            cookie = result.pop("_session_cookie", None)
            user = {k: v for k, v in result.items() if k != "_session_cookie"}
            if cookie:
                self.authCompleted.emit({"user": user, "_session_cookie": cookie})
            else:
                self.authCompleted.emit({"user": user})
            return user

        self._launch(call_and_notify, (), self.registerVerifyDone)

    @Slot(str)
    def registerResend(self, gmail):
        log.info("bridge.registerResend: gmail=%s", gmail)
        self._launch(self.server.register_resend, (gmail,), self.registerResendDone)

    @Slot(str, str, str)
    def login(self, login, gmail, password):
        log.info("bridge.login: login=%s gmail=%s", login, gmail)
        self._launch(self.server.login, (login, gmail, password), self.loginStep1Done)

    @Slot(str, str)
    def loginVerify(self, gmail, code):
        log.info("bridge.loginVerify: gmail=%s", gmail)

        def call_and_notify():
            result = self.server.login_verify(gmail, code)
            cookie = result.pop("_session_cookie", None)
            user = {k: v for k, v in result.items() if k != "_session_cookie"}
            if cookie:
                self.authCompleted.emit({"user": user, "_session_cookie": cookie})
            else:
                self.authCompleted.emit({"user": user})
            return user

        self._launch(call_and_notify, (), self.loginVerifyDone)

    @Slot(str)
    def loginResend(self, gmail):
        log.info("bridge.loginResend: gmail=%s", gmail)
        self._launch(self.server.login_resend, (gmail,), self.loginResendDone)
