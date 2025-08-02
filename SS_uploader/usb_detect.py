import wmi
import requests
import datetime
import os
import json
import time
import pythoncom
import signal
import sys
from HeartBeatChecker import HeartbeatChecker
import schedule 

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'sems_config.json')
API_BASE_URL = "http://localhost:3000"

def handle_exit(sig, frame):
    print(" Gracefully shutting down USB detector...")
    sys.exit(0)

# Signal handling
signal.signal(signal.SIGTERM, handle_exit)
signal.signal(signal.SIGINT, handle_exit)

# Load employee info
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)
EMPLOYEE_ID = config["id"]
HEADERS = {'Authorization': f'Bearer {config["token"]}'}
#EMPLOYEE_NAME = config["name"]

heartbeat = HeartbeatChecker(
    api_base_url=API_BASE_URL,
    employee_id=EMPLOYEE_ID,
    headers=HEADERS,
    script_name="usb_detect.py",
)

print("[USB] USB Detection script running on Windows...")

# Setup WMI monitoring
pythoncom.CoInitialize()
c = wmi.WMI()

watcher_insert = c.watch_for(
    notification_type="Creation",
    wmi_class="Win32_USBHub"
)

watcher_remove = c.watch_for(
    notification_type="Deletion",
    wmi_class="Win32_USBHub"
)

def notify_admin(employee_id, event):
    try:
        res = requests.post(f"{API_BASE_URL}/employee/notify-suspicious", json={
            "employee_id": employee_id,
            "event": f"USB {event}"
        },headers=HEADERS)
        if res.status_code == 200:
            print(f"[NOTIFY] USB {event} alert sent for Employee ID {employee_id}")
        else:
            print(f"[NOTIFY ERROR] {res.status_code} – {res.text}")
    except Exception as e:
        print(f"[NOTIFY EXCEPTION] {e}")

schedule.every(3).seconds.do(heartbeat.send)

while not heartbeat.should_shutdown():
    try:
        inserted = watcher_insert(timeout_ms=1000)
        if inserted:
            now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            res = requests.post(f"{API_BASE_URL}/admin/log_usb", json={
                "employee_id": EMPLOYEE_ID,
                "event": "Inserted",
                "timestamp": now
            },headers=HEADERS)
            print(f"[USB] USB Inserted at {now}")
            notify_admin(EMPLOYEE_ID, "Inserted")

    except wmi.x_wmi_timed_out:
        pass

    try:
        removed = watcher_remove(timeout_ms=1000)
        if removed:
            now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            res = requests.post(f"{API_BASE_URL}/admin/log_usb", json={
                "employee_id": EMPLOYEE_ID,
                "event": "Removed",
                "timestamp": now
            },headers=HEADERS)
            print(f"[USB] USB Removed at {now}")
            notify_admin(EMPLOYEE_ID, "Removed")

    except wmi.x_wmi_timed_out:
        pass
    schedule.run_pending()
    time.sleep(0.5)


