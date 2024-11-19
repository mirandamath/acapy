const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Armazenar os clientes WebSocket conectados
let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

// Rota para receber webhooks do ACA-Py
app.post('/webhooks/*', (req, res) => {
  const event = req.body;
  
  // Enviar o evento para todos os clientes WebSocket conectados
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });

  res.status(200).send();
});

server.listen(3001, () => {
  console.log('Servidor de webhooks rodando na porta 3001');
});
