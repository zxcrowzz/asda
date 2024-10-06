const WebSocket = require('ws');
const { v4: uuidV4 } = require('uuid');

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws) => {
    console.log('New connection');

    // Assign a unique ID to each client
    ws.id = uuidV4();

    // Notify all clients about a new user connection
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'user-connected',
                id: ws.id
            }));
        }
    });

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'video-offer':
                // Send the video offer to all clients
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'video-offer',
                            sdp: data.sdp,
                            id: ws.id
                        }));
                    }
                });
                break;

            case 'video-answer':
                // Send the video answer to the specific client
                wss.clients.forEach(client => {
                    if (client.id === data.id && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'video-answer',
                            sdp: data.sdp,
                            id: ws.id
                        }));
                    }
                });
                break;

            case 'ice-candidate':
                // Send the ICE candidate to all clients except the sender
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'ice-candidate',
                            candidate: data.candidate,
                            id: ws.id
                        }));
                    }
                });
                break;
        }
    });

    ws.on('close', () => {
        console.log('Connection closed', ws.id);
    });
});


