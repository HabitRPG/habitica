import express from 'express';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import http from 'http';

const app = express();
const server = http.createServer(app);

const PORT = process.env.TEST_WEBHOOK_APP_PORT || 3099; // eslint-disable-line no-process-env

const webhookData = {};
// Callbacks registered by waitForWebhookData, called whenever a webhook arrives
const webhookListeners = {};

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
  (webhookListeners[id] || []).forEach(listener => listener());

  res.sendStatus(200);
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

// Resolves once at least `count` webhooks have been received for `id`
// and not yet retrieved with getWebhookData
function waitForWebhookData (id, { count = 1, timeout = 2000 } = {}) {
  return new Promise((resolve, reject) => {
    const received = () => (webhookData[id] || []).length >= count;
    if (received()) {
      resolve();
      return;
    }

    let timer;
    const listener = () => {
      if (!received()) return;
      clearTimeout(timer);
      webhookListeners[id] = webhookListeners[id].filter(l => l !== listener);
      resolve();
    };
    timer = setTimeout(() => {
      webhookListeners[id] = webhookListeners[id].filter(l => l !== listener);
      reject(new Error(`Expected ${count} webhook(s) for ${id} within ${timeout}ms`));
    }, timeout);

    if (!webhookListeners[id]) webhookListeners[id] = [];
    webhookListeners[id].push(listener);
  });
}

export default {
  start,
  close,
  getWebhookData,
  waitForWebhookData,
  port: PORT,
};
