import requests
from datetime import datetime as dt

class HeartbeatChecker:
    def __init__(self, api_base_url, employee_id, headers, script_name, interval=30, failure_threshold=3):
        self.api_base_url = api_base_url
        self.employee_id = employee_id
        self.headers = headers
        self.script_name = script_name
        self.interval = interval
        self.failure_threshold = failure_threshold
        self.last_heartbeat = dt.now()
        self.failures = 0
        self.shutdown_flag = False


    def should_shutdown(self):
        return self.shutdown_flag

    def send(self):
        print("[HEARTBEAT] Sending heartbeat...")
        try:
            res = requests.post(
                f"{self.api_base_url}/employee/heartbeat",
                json={"employee_id": self.employee_id, "script": self.script_name},
                headers=self.headers,
                timeout=5
            )
            if res.status_code == 200:
                self.last_heartbeat = dt.now()
                self.failures = 0
                print(f"[HEARTBEAT] OK at {self.last_heartbeat.strftime('%H:%M:%S')}")
                return True
            else:
                self.failures += 1
                print(f"[HEARTBEAT] Server responded with {res.status_code}")
        except Exception as e:
            self.failures += 1
            print(f"[HEARTBEAT] Failed ({self.failures}): {e}")

        if self.failures >= self.failure_threshold:
            print("[HEARTBEAT] Too many failures. Shutting down...")
            self.shutdown_flag = True
        return False