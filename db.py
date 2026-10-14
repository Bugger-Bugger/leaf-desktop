"""
db.py — SQLite-хранилище для пользователей, сессий и плейлистов.
"""
from __future__ import annotations

import hashlib
import json
import os
import secrets
import sqlite3
import time
from contextlib import contextmanager
from typing import Optional

_DB_PATH = os.path.join(os.path.dirname(__file__), "leaf.db")
_conn: Optional[sqlite3.Connection] = None


def _get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute("PRAGMA journal_mode=WAL")
        _conn.execute("PRAGMA foreign_keys=ON")
        _init_tables(_conn)
    return _conn


def _init_tables(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            login       TEXT    NOT NULL UNIQUE,
            username    TEXT    NOT NULL,
            gmail       TEXT    NOT NULL UNIQUE,
            password    TEXT    NOT NULL,
            avatar_url  TEXT    DEFAULT '',
            created_at  REAL    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token       TEXT    NOT NULL UNIQUE,
            created_at  REAL    NOT NULL,
            expires_at  REAL    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name        TEXT    NOT NULL,
            track_ids   TEXT    DEFAULT '[]',
            created_at  REAL    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS verification_codes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            gmail       TEXT    NOT NULL,
            code        TEXT    NOT NULL,
            purpose     TEXT    NOT NULL,
            created_at  REAL    NOT NULL,
            expires_at  REAL    NOT NULL
        );
    """)


@contextmanager
def get_db():
    conn = _get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise


# ─── Хеширование паролей ────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(stored: str, password: str) -> bool:
    try:
        salt, h = stored.split(":", 1)
        return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except Exception:
        return False


# ─── Пользователи ───────────────────────────────────────────────

def create_user(login: str, username: str, gmail: str, password: str) -> dict:
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO users (login, username, gmail, password, created_at) VALUES (?, ?, ?, ?, ?)",
            (login, username, gmail, hash_password(password), time.time()),
        )
        return {"id": cur.lastrowid, "login": login, "username": username, "gmail": gmail}


def get_user_by_login(login: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE login = ?", (login,)).fetchone()
        return dict(row) if row else None


def get_user_by_gmail(gmail: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE gmail = ?", (gmail,)).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


def user_public(user: dict) -> dict:
    return {
        "id": user["id"],
        "login": user["login"],
        "username": user["username"],
        "gmail": user["gmail"],
        "avatar_url": user.get("avatar_url", ""),
    }


# ─── Сессии ─────────────────────────────────────────────────────

_SESSION_TTL = 30 * 24 * 3600  # 30 дней


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    now = time.time()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (user_id, token, now, now + _SESSION_TTL),
        )
    return token


def get_session_user(token: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute(
            "SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id "
            "WHERE s.token = ? AND s.expires_at > ?",
            (token, time.time()),
        ).fetchone()
        return dict(row) if row else None


def delete_session(token: str) -> None:
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


# ─── Коды подтверждения ─────────────────────────────────────────

_CODE_TTL = 10 * 60  # 10 минут


def save_verification_code(gmail: str, code: str, purpose: str) -> None:
    now = time.time()
    with get_db() as conn:
        conn.execute(
            "DELETE FROM verification_codes WHERE gmail = ? AND purpose = ?",
            (gmail, purpose),
        )
        conn.execute(
            "INSERT INTO verification_codes (gmail, code, purpose, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
            (gmail, code, purpose, now, now + _CODE_TTL),
        )


def check_verification_code(gmail: str, code: str, purpose: str) -> bool:
    with get_db() as conn:
        row = conn.execute(
            "SELECT 1 FROM verification_codes WHERE gmail = ? AND code = ? AND purpose = ? AND expires_at > ?",
            (gmail, code, purpose, time.time()),
        ).fetchone()
        if row:
            conn.execute(
                "DELETE FROM verification_codes WHERE gmail = ? AND purpose = ?",
                (gmail, purpose),
            )
            return True
        return False


# ─── Плейлисты ──────────────────────────────────────────────────

def get_user_playlists(user_id: int) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["track_ids"] = json.loads(d["track_ids"])
            result.append(d)
        return result


def create_playlist(user_id: int, name: str) -> dict:
    now = time.time()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO playlists (user_id, name, track_ids, created_at) VALUES (?, ?, ?, ?)",
            (user_id, name, "[]", now),
        )
        return {"id": cur.lastrowid, "user_id": user_id, "name": name, "track_ids": [], "created_at": now}


def add_to_playlist(playlist_id: int, user_id: int, track_id: str) -> bool:
    with get_db() as conn:
        row = conn.execute(
            "SELECT track_ids FROM playlists WHERE id = ? AND user_id = ?",
            (playlist_id, user_id),
        ).fetchone()
        if not row:
            return False
        ids = json.loads(row["track_ids"])
        if track_id in ids:
            ids.remove(track_id)
        ids.append(track_id)
        conn.execute(
            "UPDATE playlists SET track_ids = ? WHERE id = ?", (json.dumps(ids), playlist_id)
        )
        return True
