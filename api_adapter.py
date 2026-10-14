"""
api_adapter.py — Local API adapter for the desktop client.

Architecture:
  SPA (static/) runs in QWebEngineView loaded from localhost
    -> fetch('/api/search?q=...') to localhost:PORT
    -> api_adapter handles search/stream locally via SoundCloud/yt-dlp
    -> auth/playlist requests proxied to remote server.py

When server is unreachable, search/stream still work locally.
Auth and playlists become unavailable until server reconnects.
"""
from __future__ import annotations

import json
import logging
import os
import re
import secrets
import socket
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional
from urllib.parse import quote

import requests as http_requests
from flask import Flask, Response, jsonify, request as flask_request, send_from_directory, stream_with_context

from api_client import ServerClient, ApiError

log = logging.getLogger("leaf.adapter")

STATIC_DIR = Path(__file__).resolve().parent / "static"

_server_client: Optional[ServerClient] = None
_is_online: bool = False
_local_port: int = 0


def set_server_client(client: ServerClient):
    global _server_client
    _server_client = client


def set_online_status(online: bool):
    global _is_online
    _is_online = online


def set_local_port(port: int):
    global _local_port
    _local_port = port


app = Flask(__name__)


# ─── SoundCloud / yt-dlp (local) ────────────────────────────

_sc_client = None
try:
    from soundcloud import SoundCloud
    _sc_client = SoundCloud()
except Exception:
    log.warning("SoundCloud not available locally")

USER_AGENT = "Mozilla/5.0 (LeafMusic/3.0)"
SEARCH_LIMIT = 50
SEARCH_LIMIT_MAX = 500
HOME_LIMIT = 70
DEFAULT_HOME_QUERY = "popular music mix"
PLAYLIST_TRACK_LIMIT = 20

CURATED_PLAYLISTS = [
    {"id": "genre-ambient", "name": "Ambient", "query": "ambient chill soundscapes"},
    {"id": "genre-electronic", "name": "Electronic", "query": "electronic dance mix"},
    {"id": "genre-indie", "name": "Indie", "query": "indie rock playlist"},
    {"id": "genre-folk", "name": "Folk", "query": "folk acoustic session"},
    {"id": "genre-classical", "name": "Classical", "query": "classical piano"},
    {"id": "genre-lofi", "name": "Lo-Fi", "query": "lofi beats to relax"},
    {"id": "genre-jazz", "name": "Jazz", "query": "jazz standards"},
    {"id": "genre-soul", "name": "Soul", "query": "soul rnb mix"},
]


def format_duration(seconds):
    if not seconds:
        return "0:00"
    seconds = int(seconds)
    m, s = divmod(seconds, 60)
    return f"{m}:{s:02d}"


def normalize_soundcloud(track) -> dict:
    artwork = track.artwork_url or ""
    if artwork:
        artwork = artwork.replace("-large.", "-t500x500.")
    raw_duration = track.duration or 0
    if raw_duration > 10000:
        duration_sec = int(raw_duration / 1000)
    else:
        duration_sec = int(raw_duration)
    return {
        "id": str(track.id),
        "title": track.title or "Untitled",
        "artist": (track.user.get("username", "SoundCloud")
                    if hasattr(track, "user") and track.user else "SoundCloud"),
        "cover": artwork or "https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=400",
        "duration": duration_sec,
        "durationFormatted": format_duration(duration_sec),
        "genre": getattr(track, "genre", "") or "",
        "streamSrc": track.permalink_url or "",
    }


def normalize_ytdlp(entry):
    if not entry:
        return None
    stream_src = entry.get("url") or entry.get("webpage_url")
    if not stream_src:
        return None
    artwork = entry.get("thumbnail") or entry.get("cover") or entry.get("cover_url", "")
    if artwork:
        if "soundcloud" in artwork or "sndcdn" in artwork:
            artwork = re.sub(r"-(large|t500x500|t300x300|t200x200|t67x67|t50x50)", "-t500x500", artwork)
        elif "ytimg" in artwork:
            artwork = re.sub(r"/(hqdefault|mqdefault|default)\.jpg$", "/maxresdefault.jpg", artwork)
    if not artwork:
        artwork = "https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=400"
    duration = entry.get("duration") or 0
    genre = entry.get("genre") or (entry.get("categories", [""])[0] if entry.get("categories") else "")
    if not genre:
        genre = entry.get("uploader") or "SoundCloud"
    return {
        "id": entry.get("id") or stream_src,
        "title": entry.get("title") or "Untitled",
        "artist": entry.get("uploader") or "SoundCloud",
        "cover": artwork,
        "duration": duration,
        "durationFormatted": format_duration(duration),
        "genre": genre,
        "streamSrc": stream_src,
    }


def run_search_sc(query, limit=SEARCH_LIMIT):
    if not _sc_client:
        return []
    try:
        results = _sc_client.search_tracks(query, limit=limit)
        tracks = []
        for t in (results or []):
            try:
                tracks.append(normalize_soundcloud(t))
            except Exception:
                continue
        return tracks
    except Exception as e:
        log.error("SoundCloud search error: %s", e)
        return []


def run_search_ytdlp(query, limit=SEARCH_LIMIT):
    try:
        from yt_dlp import YoutubeDL
        ydl_opts = {
            "format": "bestaudio/best", "noplaylist": True, "extract_flat": True,
            "quiet": True, "no_warnings": True, "ignoreerrors": True,
            "extractor_args": {"soundcloud": {"formats": ["download"]}},
        }
        search_query = f"scsearch{limit}:{query}"
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(search_query, download=False)
        entries = (info or {}).get("entries", []) or []
        tracks = []
        for entry in entries:
            if entry:
                n = normalize_ytdlp(entry)
                if n:
                    tracks.append(n)
        return tracks
    except Exception as e:
        log.error("yt-dlp search error: %s", e)
        return []


def run_search(query, limit=SEARCH_LIMIT):
    tracks = run_search_sc(query, limit)
    if not tracks:
        tracks = run_search_ytdlp(query, limit)
    return tracks


# ─── Telemetry (local) ──────────────────────────────────────

@app.route("/api/telemetry/status")
def telemetry_status():
    try:
        from telemetry import get_audio_device, get_greeting_key, get_system_uptime_seconds
        dt = __import__("datetime").datetime.now()
        uptime = get_system_uptime_seconds()
        hours = int(uptime // 3600)
        minutes = int((uptime % 3600) // 60)
        device = get_audio_device()
        return {
            "hour": dt.hour,
            "greeting": get_greeting_key(dt.hour),
            "uptimeSeconds": round(uptime, 1),
            "uptimeFormatted": f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m",
            "audioDevice": device or "Default Audio Device",
        }
    except Exception as e:
        log.warning("Telemetry error: %s", e)
        from datetime import datetime
        now = datetime.now()
        return {
            "hour": now.hour, "greeting": "day",
            "uptimeSeconds": 0, "uptimeFormatted": "0m",
            "audioDevice": "Default Audio Device",
        }


# ─── Search (local) ─────────────────────────────────────────

@app.route("/api/search")
def api_search():
    q = flask_request.args.get("q", "").strip()
    if not q:
        return jsonify({"query": "", "tracks": []})
    try:
        limit = int(flask_request.args.get("limit", SEARCH_LIMIT))
    except (TypeError, ValueError):
        limit = SEARCH_LIMIT
    limit = max(1, min(limit, SEARCH_LIMIT_MAX))
    try:
        tracks = run_search(q, limit=limit)
        return jsonify({"query": q, "tracks": tracks, "limit": limit})
    except Exception as e:
        log.error("Search error: %s", e)
        return jsonify({"query": q, "tracks": [], "error": str(e)}), 500


# ─── Home (local) ───────────────────────────────────────────

@app.route("/api/home")
def api_home():
    try:
        tracks = run_search(DEFAULT_HOME_QUERY, limit=HOME_LIMIT)
        return jsonify({"tracks": tracks})
    except Exception as e:
        log.error("Home error: %s", e)
        return jsonify({"tracks": [], "error": str(e)}), 500


# ─── Curated Playlists (local) ──────────────────────────────

@app.route("/api/playlists")
def api_playlists():
    def fetch_playlist(playlist):
        tracks = run_search(playlist["query"], limit=PLAYLIST_TRACK_LIMIT)
        if not tracks:
            return None
        return {
            "id": playlist["id"], "name": playlist["name"],
            "description": playlist["query"], "cover": tracks[0]["cover"],
            "trackCount": len(tracks), "tracks": tracks,
        }
    try:
        with ThreadPoolExecutor(max_workers=min(8, len(CURATED_PLAYLISTS))) as pool:
            results = list(pool.map(fetch_playlist, CURATED_PLAYLISTS))
        playlists = [p for p in results if p]
        return jsonify({"playlists": playlists})
    except Exception as e:
        log.error("Playlists error: %s", e)
        return jsonify({"playlists": [], "error": str(e)}), 500


# ─── Streaming (local proxy) ────────────────────────────────

@app.route("/stream")
def stream_track():
    track_url = flask_request.args.get("url", "")
    if not track_url:
        return "Missing track url", 400
    try:
        if _sc_client and "soundcloud.com" in track_url:
            try:
                track = _sc_client.resolve(track_url)
                stream_url = track.stream_url
                if stream_url:
                    headers = {"User-Agent": USER_AGENT}
                    upstream = http_requests.get(stream_url, stream=True, headers=headers,
                                                 timeout=30, allow_redirects=True)
                    content_type = upstream.headers.get("Content-Type", "audio/mpeg")
                    def generate():
                        for chunk in upstream.iter_content(chunk_size=16384):
                            if chunk:
                                yield chunk
                    return Response(stream_with_context(generate()), content_type=content_type,
                                    headers={"Cache-Control": "no-cache", "Accept-Ranges": "bytes",
                                             "Access-Control-Allow-Origin": "*"})
            except Exception as e:
                log.warning("SoundCloud stream fallback to yt-dlp: %s", e)

        from yt_dlp import YoutubeDL
        ydl_opts = {"format": "bestaudio/best", "quiet": True, "no_warnings": True, "ignoreerrors": True}
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(track_url, download=False)
        if not info:
            return "Could not resolve track", 404
        direct_url = info.get("url")
        if not direct_url:
            formats = info.get("formats", [])
            if formats:
                best_format = max(formats, key=lambda f: f.get("bitrate", 0) or 0)
                direct_url = best_format.get("url")
        if not direct_url:
            return "Could not resolve a direct audio stream", 404
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "audio/webm,audio/ogg,audio/wav,audio/mpeg,*/*;q=0.9",
            "Accept-Encoding": "gzip, deflate, br", "Connection": "keep-alive", "Range": "bytes=0-",
        }
        upstream = http_requests.get(direct_url, stream=True, headers=headers,
                                     timeout=30, allow_redirects=True)
        content_type = upstream.headers.get("Content-Type", "audio/mpeg")
        def generate():
            for chunk in upstream.iter_content(chunk_size=16384):
                if chunk:
                    yield chunk
        return Response(stream_with_context(generate()), content_type=content_type,
                        headers={"Cache-Control": "no-cache", "Accept-Ranges": "bytes",
                                 "Access-Control-Allow-Origin": "*"})
    except Exception as e:
        log.error("Stream error: %s", e)
        return f"Streaming error: {e}", 500


# ─── Auth/Playlist proxy to server.py ───────────────────────

@app.route("/api/register", methods=["POST"])
def proxy_register():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.register(
            data.get("login", ""), data.get("username", ""),
            data.get("gmail", ""), data.get("password", ""),
            data.get("password_confirm", ""), data.get("agree_to_terms", False),
        )
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/register/verify", methods=["POST"])
def proxy_register_verify():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.register_verify(data.get("gmail", ""), data.get("code", ""))
        cookie = result.pop("_session_cookie", None)
        resp = jsonify(result)
        if cookie:
            resp.set_cookie("session", cookie, httponly=True, samesite="Lax", max_age=30 * 86400)
        return resp
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/register/resend", methods=["POST"])
def proxy_register_resend():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.register_resend(data.get("gmail", ""))
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/login", methods=["POST"])
def proxy_login():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.login(data.get("login", ""), data.get("gmail", ""), data.get("password", ""))
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/login/verify", methods=["POST"])
def proxy_login_verify():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.login_verify(data.get("gmail", ""), data.get("code", ""))
        cookie = result.pop("_session_cookie", None)
        resp = jsonify(result)
        if cookie:
            resp.set_cookie("session", cookie, httponly=True, samesite="Lax", max_age=30 * 86400)
        return resp
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/login/resend", methods=["POST"])
def proxy_login_resend():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        result = _server_client.login_resend(data.get("gmail", ""))
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/me")
def proxy_me():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    try:
        cookie = flask_request.cookies.get("session", "")
        if cookie:
            _server_client.restore_session_cookie(cookie)
        result = _server_client.me()
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/logout", methods=["POST"])
def proxy_logout():
    if _server_client:
        try:
            cookie = flask_request.cookies.get("session", "")
            if cookie:
                _server_client.restore_session_cookie(cookie)
            _server_client.logout()
        except Exception:
            pass
    resp = jsonify({"ok": True})
    resp.delete_cookie("session")
    return resp


@app.route("/api/user/playlists")
def proxy_user_playlists():
    if not _is_online or not _server_client:
        return jsonify({"playlists": []})
    try:
        cookie = flask_request.cookies.get("session", "")
        if cookie:
            _server_client.restore_session_cookie(cookie)
        result = _server_client.get_user_playlists()
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/user/playlists", methods=["POST"])
def proxy_create_playlist():
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        cookie = flask_request.cookies.get("session", "")
        if cookie:
            _server_client.restore_session_cookie(cookie)
        result = _server_client.create_playlist(data.get("name", ""))
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


@app.route("/api/user/playlists/<int:pl_id>/add", methods=["POST"])
def proxy_add_to_playlist(pl_id):
    if not _is_online or not _server_client:
        return jsonify({"detail": "Сервер недоступен"}), 503
    data = flask_request.get_json(force=True, silent=True) or {}
    try:
        cookie = flask_request.cookies.get("session", "")
        if cookie:
            _server_client.restore_session_cookie(cookie)
        result = _server_client.add_to_playlist(pl_id, data.get("track_id", ""))
        return jsonify(result)
    except ApiError as e:
        return jsonify({"detail": e.message}), e.status or 502


# ─── Static files (MUST be last) ───────────────────────────

@app.route("/")
def index():
    return send_from_directory(str(STATIC_DIR), "index.html")


@app.route("/<path:path>")
def serve_static(path):
    file_path = STATIC_DIR / path
    if file_path.is_file():
        return send_from_directory(str(STATIC_DIR), path)
    return send_from_directory(str(STATIC_DIR), "index.html")


# ─── Local server ──────────────────────────────────────────

class LocalApiServer:
    def __init__(self):
        self.port = self._find_free_port()
        self._server = None
        self._thread = None

    @staticmethod
    def _find_free_port() -> int:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]

    def start(self):
        from werkzeug.serving import make_server
        self._server = make_server("127.0.0.1", self.port, app, threaded=True)
        self._server.log_request = lambda *a, **kw: None
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()
        set_local_port(self.port)
        log.info("Local API server started on port %d", self.port)

    def stop(self):
        if self._server:
            self._server.shutdown()
            log.info("Local API server stopped")

    @property
    def base_url(self) -> str:
        return f"http://127.0.0.1:{self.port}"
