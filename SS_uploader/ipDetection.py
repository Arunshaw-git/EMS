import sys
import os
import subprocess
import asyncio
import psutil
import json
import requests
import time
from datetime import datetime, timedelta
from urllib.parse import urlparse

active_sessions = {}  # {domain: {'last_seen': datetime, 'notified': True}}

SESSION_TIMEOUT = timedelta(minutes=3)  # Consider the session inactive if no packet seen for 3 minutes
SESSION_FLAG_FILE = os.path.join(os.path.dirname(__file__), "session_flag.json")

import threading

def update_session_flag(active: bool):
    try:
        with open(SESSION_FLAG_FILE, "w") as f:
            json.dump({"active": active}, f)
        print(f"[FLAG] session_flag.json updated to active={active}")
    except Exception as e:
        print(f"[FLAG ERROR] Could not write session_flag.json: {e}")

def background_session_cleanup():
    while True:
        cleanup_inactive_sessions()
        time.sleep(5)  # Check every 5 seconds


def get_root_domain(host):
    parts = host.split('.')
    if len(parts) >= 2:
        return '.'.join(parts[-2:])  # twitter.com, facebook.com
    return host

def update_sessions(domain):
    now = datetime.now()

    if domain not in active_sessions:
        # New session
        session_id = log_session_start(domain, now)
        if session_id:
            active_sessions[domain] = {
                'last_seen': now,
                'session_id': session_id,
                'start_time': now
            }
            update_session_flag(True) 
            return 'new'
        return 'error'

    # ⏱️ Only update if > 5 seconds since last_seen
    last_seen = active_sessions[domain]['last_seen']
    if (now - last_seen).total_seconds() > 10:
        active_sessions[domain]['last_seen'] = now

    return 'existing'

def cleanup_inactive_sessions():
    now = datetime.now()
    expired_sessions = []

    for domain, data in active_sessions.items():
        elapsed = now - data['last_seen']
        print(f"[CHECK] {domain} | last_seen: {data['last_seen']} | now: {now} | elapsed: {elapsed.total_seconds():.2f}s")
        
        if elapsed > SESSION_TIMEOUT:
            expired_sessions.append(domain)

    for domain in expired_sessions:
        print(f"[SESSION CLOSED] {domain}")
        log_session_end(domain)
        del active_sessions[domain]
    if not active_sessions:
        update_session_flag(False)



def log_session_start(domain, start_time):
    default_end = start_time + timedelta(minutes=3)

    payload = {
        "employee_id": EMPLOYEE_ID,
        "domain": domain,
        "start_time": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": default_end.strftime("%Y-%m-%d %H:%M:%S")  # default end_time

    }

    try:
        res = requests.post("http://localhost:3000/auth/start_social_media_session", json=payload)
        if res.status_code == 200:
            log_id = res.json().get("log_id")
            print(f"[SESSION STARTED] {domain} (ID: {log_id})")
            return log_id
        else:
            print(f"[START LOG ERROR] {res.status_code}: {res.text}")
    except Exception as e:
        print(f"[START LOG EXCEPTION] {e}")
    return None

def log_session_end(domain):
    session = active_sessions.get(domain)
    if not session:
        return

    payload = {
        "session_id": session["session_id"],
        "end_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        res = requests.post("http://localhost:3000/auth/end_social_media_session", json=payload)
        if res.status_code == 200:
            print(f"[SESSION ENDED] {domain} (ID: {session['session_id']})")
        else:
            print(f"[END LOG ERROR] {res.status_code}: {res.text}")
    except Exception as e:
        print(f"[END LOG EXCEPTION] {e}")


CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'sems_config.json')
# Add pyTLSSniff folder to the Python path
pytlssniff_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pyTLSSniff'))
if pytlssniff_root not in sys.path:
    sys.path.insert(0, pytlssniff_root)

import pyshark.capture.live_capture as live_capture

# Hide subprocess terminals (Windows only)
if os.name == "nt":
    # Patch subprocess.Popen
    _original_popen = subprocess.Popen

    def silent_popen(*args, **kwargs):
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        kwargs["startupinfo"] = si
        kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        return _original_popen(*args, **kwargs)

    subprocess.Popen = silent_popen

    # Patch asyncio.create_subprocess_exec
    _original_create_exec = asyncio.create_subprocess_exec

    async def silent_create_exec(*args, **kwargs):
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        kwargs["startupinfo"] = si
        kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        return await _original_create_exec(*args, **kwargs)

    asyncio.create_subprocess_exec = silent_create_exec


from pytlssniff import TLSHandshakeSniffer  # Assuming __init__.py exposes this

with open(CONFIG_PATH, 'r') as f:
    emp = json.load(f)
EMPLOYEE_ID = emp["id"]
EMPLOYEE_NAME = emp["name"]

def notify(event,employee_id=EMPLOYEE_ID):
    payload = {
        "employee_id":employee_id,
        "event": f"{event} opened "
    }
    try:
        res = requests.post("http://localhost:3000/employee/notify-suspicious",json=payload)
        if  res.status_code == 200:
            print(f"[NOTIFY] Social meda webiste connected : {event} alert sent for Employee ID {employee_id}")
        else:
            print(f"[NOTIFY ERROR] {res.status_code} – {res.text}")
    except Exception as e:
        print(f"[NOTIFY EXCEPTION] {e}")

            

def get_tshark_interfaces():
    try:
        # Absolute paths 
        tshark_path = r"C:\Program Files\Wireshark\tshark.exe"  # Adjust if installed elsewhere

        if not os.path.exists(tshark_path):
            print(f"[ERROR] TShark not found at: {tshark_path}")
            return []
        
        result = subprocess.run(
            [tshark_path, "-D"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        return result.stdout.strip().splitlines()

    except Exception as e:
        print(f"[ERROR] Failed to get interfaces: {e}")
        return []
        

def extract_interface_name(interface_line):
    parts = interface_line.split()
    return parts[1] if len(parts) > 1 else None

def start_tls_sniffer(interface_name):
    watchlist = [
        "facebook.com", "instagram.com", "twitter.com", 
        "whatsapp.com", "telegram.org", "messenger.com"
    ]
    sniffer = TLSHandshakeSniffer(interface=interface_name)
    while True:
        for packet in sniffer.listen(sniff_sni=True):
            if packet and packet.sni:
                sni_lower = packet.sni.lower()
                root_domain = get_root_domain(sni_lower)

                # 👇 only log if it's in the watchlist
                if root_domain in watchlist:
                    session_status = update_sessions(root_domain)
                    if session_status == 'new':
                        notify(event=root_domain)
                        print(f"[SESSION STARTED] {root_domain}")
        cleanup_inactive_sessions()
 

def detect_active_interface():
    stats = psutil.net_if_stats()
    io = psutil.net_io_counters(pernic=True)

    active = []
    for iface in stats:
        if stats[iface].isup and iface in io:
            bytes_sent = io[iface].bytes_sent
            bytes_recv = io[iface].bytes_recv
            if bytes_sent > 0 or bytes_recv > 0:
                active.append(iface)

    return active


def match_interface_with_tshark(active_ifaces, tshark_list):
    for line in tshark_list:
        for active in active_ifaces:
            if active.lower() in line.lower():
                return extract_interface_name(line)
    return None

if __name__ == "__main__":
    update_session_flag(False)  
    tshark_interfaces = get_tshark_interfaces()
    print(f"[DEBUG] All TShark Interfaces: {tshark_interfaces}")
    if not tshark_interfaces:
        exit(1)

    active_ifaces = detect_active_interface()
    print(f"[DEBUG] Active OS Interfaces: {active_ifaces}")

    interface_name = match_interface_with_tshark(active_ifaces, tshark_interfaces)
    if not interface_name:
        print("[WARN] No active match found. Falling back to first interface.")
        interface_name = extract_interface_name(tshark_interfaces[0])

    print(f"\n[INFO] Using interface: {interface_name}")
    print("[INFO] Starting pyTLSSniff...\n")
    threading.Thread(target=background_session_cleanup, daemon=True).start()

    start_tls_sniffer(interface_name=interface_name)


