import express from 'express';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import http from 'http';

const app = express();
const server = http.createServer(app);

const PORT = process.env.TEST_WEBHOOK_APP_PORT || 3099; // eslint-disable-line no-process-env

const webhookData = {};

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
}));
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/webhooks/:id', (req, res) => {
  const { id } = req.params;

  if (!webhookData[id]) {
    webhookData[id] = [];
  }

  webhookData[id].push(req.body);

  res.status(200);
});

// Helps close down server from within mocha test
// See https://stackoverflow.com/a/37054753/2601552
const sockets = {};
server.on('connection', socket => {
  const id = uuid();
  sockets[id] = socket;

  socket.once('close', () => {
    delete sockets[id];
  });
});

function start () {
  return new Promise(resolve => {
    server.listen(PORT, resolve);
  });
}

function close () {
  return new Promise(resolve => {
    server.close(resolve);

    Object.keys(sockets).forEach(socket => {
      sockets[socket].end();
    });
  });
}

function getWebhookData (id) {
  if (!webhookData[id]) {
    return null;
  }
  return webhookData[id].pop();
}

export default {
  start,
  close,
  getWebhookData,
  port: PORT,
};
