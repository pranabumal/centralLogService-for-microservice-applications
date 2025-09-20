from flask import Flask, request, Response
import requests
import psutil
import time
import os
from datetime import datetime

app = Flask(__name__)

SERVICE2_URL = "http://service2:8282/status"
STORAGE_URL = "http://service3:8383/log"

def get_status():
    uptime = time.time() - psutil.boot_time()
    disk_usage = psutil.disk_usage('/')
    timestamp = datetime.now().isoformat()
    return f"{timestamp}: uptime {uptime/3600:.2f} hours, free disk in root: {disk_usage.free/1024/1024:.2f} MBytes"

@app.route('/status')
def status():
    #analyses its status
    status1 = get_status()
    
    #Ssnding request to service3 
    requests.post(STORAGE_URL, data=status1, headers={'Content-Type': 'text/plain'})
    
    #writes the record to vStorage
    with open('/vstorage/service.log', 'a') as f:
        f.write(status1 + '\n')
    
    #forward the request to Service2
    response = requests.get(SERVICE2_URL)
    
    # 9. Service1 combines the records and returns as response
    return f"{status1}\n{response.text}", 200, {'Content-Type': 'text/plain'}

@app.route('/log')
def log():
    # 1. Service1 forwards the request to Storage
    response = requests.get(STORAGE_URL)
    # 2. Returns the content of the log
    return response.text, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8177)