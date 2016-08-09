'use strict';

let express = require('express');
let uuid = require('uuid');
let bodyParser = require('body-parser');
let app = express();
let server = require('http').createServer(app);

const PORT = process.env.TEST_WEBHOOK_APP_PORT || 3099; // eslint-disable-line no-process-env

let webhookData = {};

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

app.post('/webhooks/:id', function (req, res) {
  let id = req.params.id;

  if (!webhookData[id]) {
    webhookData[id] = [];
  }

  webhookData[id].push(req.body);

  res.status(200);
});

// Helps close down server from within mocha test
// See http://stackoverflow.com/a/37054753/2601552
let sockets = {};
server.on('connection', (socket) => {
  let id = uuid.v4();
  sockets[id] = socket;

  socket.once('close', () => {
    delete sockets[id];
  });
});

function start () {
  return new Promise((resolve) => {
    server.listen(PORT, resolve);
  });
}

function close () {
  return new Promise((resolve) => {
    server.close(resolve);

    Object.keys(sockets).forEach((socket) => {
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

module.exports = {
  start,
  close,
  getWebhookData,
  port: PORT,
};
