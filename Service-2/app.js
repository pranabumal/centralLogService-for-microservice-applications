const express = require('express');
const fs = require('fs');
const os = require('os');
const axios = require('axios');

const app = express();
app.use(express.text({ type: 'text/plain' }));

const STORAGE_URL = "http://service3:8383/log";

function getStatus() {
    const uptime = os.uptime();
    const timestamp = new Date().toISOString();
    const { execSync } = require('child_process');
    const freeDisk = execSync("df / | awk 'NR==2 {print $4}'").toString().trim();
    const freeDiskMB = (parseInt(freeDisk) * 1024) / (1024 * 1024); // Convert from KB to MB
    return `${timestamp}: uptime ${(uptime/3600).toFixed(2)} hours, free disk in root: ${freeDiskMB.toFixed(2)} MBytes`;
 
}

app.get('/status', async (req, res) => {
    try {
        const status2 = getStatus();
        console.log('Service2 status:', status2);
        await axios.post(STORAGE_URL, status2, {
            headers: { 'Content-Type': 'text/plain' }
        });
        
        fs.appendFileSync('/vstorage', status2 + '\n');
        
        res.set('Content-Type', 'text/plain');
        res.send(status2);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(8282, '0.0.0.0', () => {
    console.log('Service2 listening on port 8282');
});