const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.text({ type: 'text/plain' }));

// Use the mounted volume path
const logDir = '/log-data';  
const logFile = path.join(logDir, 'storage.log');

// Ensure directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

app.post('/log', (req, res) => {
    const logEntry = req.body;
    console.log('Received log entry:', req.body);
    fs.appendFile(logFile, logEntry + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Error writing to log');
        }
        res.send('Logged successfully');
    });
});

app.get('/log', (req, res) => {
    fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.send('');
            }
            console.error('Error reading log file:', err);
            return res.status(500).send('Error reading log');
        }
        res.set('Content-Type', 'text/plain');
        res.send(data);
    });
});
app.delete('/delete-logs', (req, res) => {
    fs.unlink(logFile, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(200).json({ 
                    message: 'Log file already empty or does not exist',
                    status: 'success' 
                });
            }
            console.error('Error deleting log file:', err);
            return res.status(500).json({ 
                message: 'Error deleting log file',
                error: err.message,
                status: 'error' 
            });
        }
        
        res.status(200).json({ 
            message: 'All logs deleted successfully',
            status: 'success' 
        });
    });
});

const port = 8383;
app.listen(port, '0.0.0.0', () => {
    console.log(`Storage service listening on port ${port}`);
});