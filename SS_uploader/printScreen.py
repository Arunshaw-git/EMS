import keyboard
import pyautogui
import datetime
import os
import requests
import json
import signal
import sys
import time
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request

from HeartBeatChecker import HeartbeatChecker
import schedule
SCOPES = ['https://www.googleapis.com/auth/drive.file']
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'sems_config.json')
API_BASE_URL = "http://localhost:3000"


def handle_exit(sig, frame):
    print("[PRINTSCREEN] Gracefully shutting down PrintScreen script...")
    keyboard.unhook_all()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGTERM, handle_exit)
signal.signal(signal.SIGINT, handle_exit)

# Load employee info
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)
EMPLOYEE_ID = config["id"]
#EMPLOYEE_NAME = emp["name"]
HEADERS = {'Authorization': f'Bearer {config["token"]}'}  # Format it as Bearer token
heartbeat= HeartbeatChecker(
    api_base_url=API_BASE_URL,
    employee_id=EMPLOYEE_ID,
    headers=HEADERS,
    script_name="printScreen.py",
)

def authenticate_drive():
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), 'token.json')
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

    if not creds or not creds.valid:
        credentials = os.path.join(os.path.dirname(__file__), 'credentials.json')
        flow = InstalledAppFlow.from_client_secrets_file(credentials, SCOPES)
        creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)

def upload_screenshot_and_log():
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    SCREENSHOT_DIR = os.path.join(SCRIPT_DIR, 'screenshots')
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    now = datetime.datetime.now()
    filename = f"printScreen_{EMPLOYEE_ID}_{now.strftime('%Y-%m-%d_%H-%M-%S')}.png"
    file_path = os.path.join(SCREENSHOT_DIR, filename)

    try:
        # Take screenshot
        image = pyautogui.screenshot()
        image.save(file_path)
        del image
        # Authenticate and upload
        service = authenticate_drive()
        with open(file_path, "rb") as f:
            media = MediaIoBaseUpload(f, mimetype="image/png")
            file_metadata = {'name': filename}
            uploaded_file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()

        file_url = f"https://drive.google.com/file/d/{uploaded_file.get('id')}/view"

        # Log to EMS
        try:
            res = requests.post(f"{API_BASE_URL}/admin/log_printScreen", json={
                "employee_id": EMPLOYEE_ID,
                "url": file_url,
                "timestamp": now.strftime('%Y-%m-%d %H:%M:%S')
            },headers=HEADERS)

            if res.status_code == 200:
                print(f"[LOGGED] Screenshot URL: {file_url}")
                notify_admin(EMPLOYEE_ID, "PrintScreen Used")
            else:
                print(f"[LOG ERROR] {res.status_code}: {res.text}")

        except Exception as e:
            print(f"[LOG EXCEPTION] {e}")

    except Exception as e:
        print(f"[UPLOAD ERROR] {e}")

    finally:
        # Safe file deletion with retry
        for i in range(3):
            try:
                os.remove(file_path)
                print(f"[PRINTSCREEN INFO] Deleted: {file_path}")
                break
            except PermissionError as e:
                print(f"[DELETE RETRY {i+1}] File in use: {e}")
                time.sleep(1)
        else:
            print(f"[WARN] Could not delete: {file_path}")


def notify_admin(employee_id, event):

    try:
        res = requests.post(f"{API_BASE_URL}/employee/notify-suspicious", json={
            "employee_id": employee_id,
            "event": event,
        },headers=HEADERS)
        if res.status_code == 200:
            print(f"[NOTIFY] {event} alert sent for Employee ID {employee_id}")
        else:
            print(f"[NOTIFY ERROR] {res.status_code} – {res.text}")
    except Exception as e:
        print(f"[NOTIFY EXCEPTION] {e}")

if __name__ == "__main__":
    print("[INFO] PrintScreen detector starting...")
    keyboard.add_hotkey('print screen', upload_screenshot_and_log)
    schedule.every(heartbeat.interval).seconds.do(heartbeat.send)
    try:
        while not heartbeat.should_shutdown():
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print("[EXIT] Manual or signal-based shutdown.")

    # Cleanup
    keyboard.unhook_all()
    schedule.clear()

    if heartbeat.should_shutdown():
        print("[EXIT] Shutdown triggered by heartbeat failure.")
    else:
        print("[EXIT] Manual or signal-based shutdown.")
