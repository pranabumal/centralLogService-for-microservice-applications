from flask import Flask, request, Response
import requests
import psutil
import time
from datetime import datetime

app = Flask(__name__)

SERVICE2_URL = "http://service2:8282/status"
STORAGE_URL = "http://service3:8383/log"
STORAGE_DELETE_URL = "http://service3:8383/delete-logs"

def get_status():
    uptime = time.time() - psutil.boot_time()
    disk_usage = psutil.disk_usage('/')
    timestamp = datetime.now().isoformat()
    return f"{timestamp}: uptime {uptime/3600:.2f} hours, free disk in root: {disk_usage.free/1024/1024:.2f} MBytes"

@app.route('/status')
def status():
    status1 = get_status()
    
    requests.post(STORAGE_URL, data=status1, headers={'Content-Type': 'text/plain'})
    
    with open('/vstorage', 'a') as f:
        f.write(status1 + '\n')
    
    response = requests.get(SERVICE2_URL)
    
    return f"{status1}\n{response.text}", 200, {'Content-Type': 'text/plain'}

@app.route('/log')
def log():
    response = requests.get(STORAGE_URL)
    return response.text, 200, {'Content-Type': 'text/plain'}

@app.route('/delete-logs')
def delete_logs():
    response = requests.delete(STORAGE_DELETE_URL)
    with open('/vstorage', 'w') as f:
            pass
    return response.text, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8177)