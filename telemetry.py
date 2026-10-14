import platform
import re
import subprocess
import time
from datetime import datetime
from flask import Blueprint, jsonify

telemetry_bp = Blueprint("telemetry", __name__)
_PROCESS_START = time.time()

def get_greeting_key(hour=None):
    if hour is None:
        hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    if 12 <= hour < 18:
        return "day"
    if 18 <= hour < 23:
        return "evening"
    return "night"

def get_system_uptime_seconds():
    try:
        if platform.system() == "Windows":
            out = subprocess.check_output(
                ["powershell", "-NoProfile", "-Command",
                 "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToUniversalTime() | Get-Date -UFormat %s"],
                timeout=5,
                stderr=subprocess.DEVNULL
            ).decode(errors="ignore").strip()
            if out:
                return max(0.0, time.time() - float(out))
    except Exception:
        pass
    return time.time() - _PROCESS_START

def _get_audio_device_windows():
    try:
        import sounddevice as sd
        devices = sd.query_devices()
        default_output_index = sd.default.device[1]
        if default_output_index is not None and default_output_index != -1:
            raw_name = devices[default_output_index]["name"]
            if isinstance(raw_name, bytes):
                try:
                    return raw_name.decode('utf-8')
                except UnicodeDecodeError:
                    return raw_name.decode('cp1251', errors='ignore')
            return str(raw_name).strip()
    except Exception as e:
        print(f"Audio device error: {e}")
    return None

def get_audio_device():
    try:
        if platform.system() == "Windows":
            device = _get_audio_device_windows()
            if device:
                return device
    except Exception:
        pass
    return None

@telemetry_bp.route("/telemetry/status")
def telemetry_status():
    now = datetime.now()
    uptime_seconds = get_system_uptime_seconds()
    hours = int(uptime_seconds // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    
    try:
        device_name = get_audio_device()
    except Exception:
        device_name = None
        
    return jsonify({
        "hour": now.hour,
        "greeting": get_greeting_key(now.hour),
        "uptimeSeconds": round(uptime_seconds, 1),
        "uptimeFormatted": f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m",
        "audioDevice": device_name if device_name else "Default Audio Device",
    })