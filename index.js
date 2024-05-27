const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('New client connected');

    // Handle messages received from clients
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
        
        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server');
});

app.get('/', (req, res) => {
    res.send('WebSocket server is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
