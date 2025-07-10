import os
import datetime
import pyautogui
import schedule
import time
import requests
import json
import sys

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request

# === SETTINGS ===
SCOPES = ['https://www.googleapis.com/auth/drive.file']
API_BASE_URL = "http://localhost:3000/"  # change if deployed

SESSION_FLAG_FILE = os.path.join(os.path.dirname(__file__), "session_flag.json")

def is_session_active():
    try:
        with open(SESSION_FLAG_FILE, "r") as f:
            data = json.load(f)
            return data.get("active", False)
    except Exception:
        return False
    
# === Setup config.json and fetch employee info from EMS ===
def setup_config_info():
    config_path = os.path.join(os.path.dirname(__file__), 'sems_config.json')

    if not sys.stdin.isatty():
        print("[FATAL] sems_config.json not found and no terminal input available. Please run manually once to generate it.")
        exit(1)

    if os.path.exists(config_path):
        print(" sems_config.json found.")
        return  

    name = input("Enter your name (same as in EMS): ").strip()

    try:
        res = requests.get(f"{API_BASE_URL}/employee/detail/by-name/{name}")
        if res.status_code != 200:
            print(f" Employee '{name}' not found. Please try again.")
            exit(1)

        emp = res.json()

        with open(config_path, 'w') as f:
            json.dump(emp, f)

        print(f"✅ Welcome {emp['name']}! Your EMS ID is {emp['id']}.")
    except Exception as e:
        print(f"[ERROR] Could not connect to EMS server: {e}") 
        exit(1)


def get_employee_info():
    config_path = os.path.join(os.path.dirname(__file__), 'sems_config.json')
    with open(config_path, 'r') as f:
        return json.load(f)

# === Authenticate Google Drive ===
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
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

# === 3. Upload File to Google Drive ===
def upload_file_to_drive(service, file_path):
    file_name = os.path.basename(file_path)
    media = MediaFileUpload(file_path, resumable=True)
    file_metadata = {'name': file_name}
    uploaded = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    file_id = uploaded.get('id')
    return f"https://drive.google.com/file/d/{file_id}/view"


# === 4. Screenshot + Upload ===
def take_screenshot_and_upload():
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

    now = datetime.datetime.now()
    filename = f"screenshot_{EMPLOYEE_NAME}_{now.strftime('%Y-%m-%d_%H-%M-%S')}.png"
    file_path = os.path.join(SCRIPT_DIR, filename)

    pyautogui.screenshot(file_path)
    time.sleep(0.3)
    try:
        url = upload_file_to_drive(service, file_path)
        print(f"[{now.strftime('%H:%M:%S')}] ✅ Uploaded: {url}")
        log_to_database(EMPLOYEE_ID, filename, url, now)

    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        os.remove(file_path)


def log_to_database( employee_id, filename, url, timestamp ):
    try: 
        payload ={
            "employee_id":employee_id,
            "filename":filename,
            "url": url,
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        res = requests.post(f"{API_BASE_URL}/admin/log_screenshot", json= payload)
        if res.status_code ==200:
            print(f"Log saved in EMS {filename} ")
        else: 
            print(f"[LOG ERROR] {res.text}")
    except Exception as e:
        print(f"[LOG EXCEPTION] {e}")

# === 5. Run Setup & Start Schedule ===
setup_config_info()
emp_info = get_employee_info()
EMPLOYEE_ID = emp_info['id']
EMPLOYEE_NAME = emp_info['name']

current_interval = None

def schedule_screenshot(interval_seconds):
    global current_interval
    if current_interval == interval_seconds:
        return  # No change needed

    schedule.clear()
    schedule.every(interval_seconds).seconds.do(take_screenshot_and_upload)
    current_interval = interval_seconds
    print(f"[UPDATE] Screenshot interval set to {interval_seconds} seconds.")


service = authenticate_drive()


print(f"🚀 SEMS running for {EMPLOYEE_NAME} (ID: {EMPLOYEE_ID}) – Press Ctrl+C to stop.")
while True:
    if is_session_active():
        schedule_screenshot(10)
    else:
        schedule_screenshot(30)

    schedule.run_pending()
    time.sleep(1)

