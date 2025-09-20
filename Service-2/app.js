const express = require('express');
const fs = require('fs');
const os = require('os');
const axios = require('axios');

const app = express();
app.use(express.text({ type: 'text/plain' }));

const STORAGE_URL = "http://service3:8383/log";

function getStatus() {
    const uptime = os.uptime();
    const diskInfo = fs.statSync('/');
    const freeDisk = diskInfo.size - diskInfo.blocks * diskInfo.blksize;
    const timestamp = new Date().toISOString();
    return `${timestamp}: uptime ${(uptime/3600).toFixed(2)} hours, free disk in root: ${(freeDisk/1024/1024).toFixed(2)} MBytes`;
}

app.get('/status', async (req, res) => {
    try {
        // 5. Service2 analyses its status
        const status2 = getStatus();
        console.log('Service2 status:', status2);
        // 6. Service2 sends the created record to Storage
        await axios.post(STORAGE_URL, status2, {
            headers: { 'Content-Type': 'text/plain' }
        });
        
        // 7. Service2 writes the record to vStorage
        fs.appendFileSync('/vstorage/service.log', status2 + '\n');
        
        // 8. Service2 sends the record as response
        res.set('Content-Type', 'text/plain');
        res.send(status2);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(8282, '0.0.0.0', () => {
    console.log('Service2 listening on port 8282');
});