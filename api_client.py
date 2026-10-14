"""
api_client.py — HTTP client for the remote server (server.py / leaf-web).

Handles auth, playlists, and DB-related operations by making HTTP requests
to the server.py running on the remote server.
"""
from __future__ import annotations

import logging
from typing import Optional
from urllib.parse import urlparse

import requests

log = logging.getLogger("leaf.api")


class ApiError(Exception):
    def __init__(self, message: str, status: int = 0, retry_after: Optional[float] = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.retry_after = retry_after


class ServerClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "LeafMusicDesktop/3.0",
            "X-Leaf-Client": "desktop",
        })

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    @staticmethod
    def _parse_error(resp: requests.Response) -> ApiError:
        try:
            body = resp.json()
        except ValueError:
            return ApiError(f"Ошибка сервера ({resp.status_code})", status=resp.status_code)
        detail = body.get("detail", "Server error") if isinstance(body, dict) else "Server error"
        retry_after = None
        if isinstance(detail, dict):
            retry_after = detail.get("retry_after")
            message = detail.get("message") or "Server error"
            attempts_left = detail.get("attempts_left")
            if attempts_left is not None:
                message = f"{message} (осталось попыток: {attempts_left})"
        elif isinstance(detail, list):
            message = "Проверьте правильность введённых данных"
        else:
            message = str(detail)
        return ApiError(message, status=resp.status_code, retry_after=retry_after)

    def _request(self, method: str, path: str, **kwargs) -> dict:
        try:
            resp = self.session.request(method, self._url(path), timeout=10, **kwargs)
            if resp.status_code >= 400:
                raise self._parse_error(resp)
            return resp.json()
        except requests.ConnectionError:
            raise ApiError("Сервер недоступен", status=0)
        except requests.Timeout:
            raise ApiError("Тайм-аут соединения", status=0)
        except ApiError:
            raise
        except Exception as e:
            raise ApiError(str(e), status=0)

    def _post(self, path: str, data: dict = None, **kwargs) -> dict:
        return self._request("POST", path, json=data, **kwargs)

    def _get(self, path: str, **kwargs) -> dict:
        return self._request("GET", path, **kwargs)

    def ping(self) -> bool:
        try:
            resp = self.session.get(self._url("/"), timeout=3)
            return resp.status_code < 500
        except Exception:
            return False

    def restore_session_cookie(self, cookie_value: str):
        for c in [c for c in self.session.cookies if c.name == "session"]:
            self.session.cookies.clear(c.domain, c.path, c.name)
        host = urlparse(self.base_url).hostname or ""
        self.session.cookies.set("session", cookie_value, domain=host, path="/")

    def session_cookie_value(self) -> Optional[str]:
        for c in self.session.cookies:
            if c.name == "session":
                return c.value
        return None

    def me(self) -> dict:
        return self._get("/api/me")

    def logout(self):
        self._post("/api/logout")

    def register(self, login: str, username: str, gmail: str,
                 password: str, password_confirm: str, agree: bool) -> dict:
        return self._post("/api/register", {
            "login": login, "username": username,
            "gmail": gmail, "password": password,
            "password_confirm": password_confirm,
            "agree_to_terms": agree,
        })

    def register_verify(self, gmail: str, code: str) -> dict:
        result = self._post("/api/register/verify", {"gmail": gmail, "code": code})
        result["_session_cookie"] = self.session_cookie_value()
        return result

    def register_resend(self, gmail: str) -> dict:
        return self._post("/api/register/resend", {"gmail": gmail})

    def login(self, login: str, gmail: str, password: str) -> dict:
        return self._post("/api/login", {
            "login": login, "gmail": gmail, "password": password,
        })

    def login_verify(self, gmail: str, code: str) -> dict:
        result = self._post("/api/login/verify", {"gmail": gmail, "code": code})
        result["_session_cookie"] = self.session_cookie_value()
        return result

    def login_resend(self, gmail: str) -> dict:
        return self._post("/api/login/resend", {"gmail": gmail})

    def get_user_playlists(self) -> dict:
        return self._get("/api/user/playlists")

    def create_playlist(self, name: str) -> dict:
        return self._post("/api/user/playlists", {"name": name})

    def add_to_playlist(self, playlist_id: int, track_id: str) -> dict:
        return self._post(f"/api/user/playlists/{playlist_id}/add", {"track_id": track_id})
