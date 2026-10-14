"""
session_store.py — сохранение и восстановление сессионной cookie между
запусками десктоп-приложения.

Почему keyring, а не просто json-файл рядом с exe: keyring кладёт секрет
в системное защищённое хранилище (Windows Credential Manager, macOS
Keychain, Secret Service/KWallet на Linux) — это не "непробиваемо" (тот же
пользователь на своей машине при желании всё равно достанет), но кратно
лучше, чем секрет открытым текстом в файле рядом с программой, и не
требует изобретать свой велосипед с шифрованием и хранением ключа от него
(ключ от самодельного AES всё равно пришлось бы держать в том же
приложении — то есть он был бы так же доступен пользователю).

pip install keyring
"""
from __future__ import annotations

import logging
from typing import Optional

import keyring

log = logging.getLogger("leaf.session")

_SERVICE_NAME = "leafmusic-desktop"
_ACCOUNT_NAME = "session_cookie"


def save_session(cookie_value: str) -> None:
    log.debug("save_session: saving cookie (len=%d)", len(cookie_value))
    keyring.set_password(_SERVICE_NAME, _ACCOUNT_NAME, cookie_value)
    log.debug("save_session: done")


def load_session() -> Optional[str]:
    try:
        val = keyring.get_password(_SERVICE_NAME, _ACCOUNT_NAME)
        log.debug("load_session: found=%s (len=%s)", bool(val), len(val) if val else 0)
        return val
    except Exception as e:
        log.warning("load_session: keyring error: %s", e)
        return None


def clear_session() -> None:
    try:
        keyring.delete_password(_SERVICE_NAME, _ACCOUNT_NAME)
        log.debug("clear_session: done")
    except keyring.errors.PasswordDeleteError:
        log.debug("clear_session: nothing to delete")