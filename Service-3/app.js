const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.text({ type: 'text/plain' }));

const logDir = path.join(__dirname, 'log-data');
const logFile = path.join(logDir, 'storage.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

app.post('/log', (req, res) => {
    const logEntry = req.body;
    console.log('Received log entry:', req.body);
    // Append to log file
    fs.appendFile(logFile, logEntry + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Error writing to log');
        }
        res.send('Logged successfully');
    });
});

app.get('/log', (req, res) => {
    // Read and return the entire log file
    fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist yet, return empty
                return res.send('');
            }
            console.error('Error reading log file:', err);
            return res.status(500).send('Error reading log');
        }
        res.set('Content-Type', 'text/plain');
        res.send(data);
    });
});

const port = 8383;
app.listen(port, '0.0.0.0', () => {
    console.log(`Storage service listening on port ${port}`);
});