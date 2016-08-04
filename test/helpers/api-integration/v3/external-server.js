'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let server;

const PORT = process.env.TEST_WEBHOOK_APP_PORT || 3099; // eslint-disable-line no-process-env

let webhookData = {};

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

app.post('/webhooks/:id', function (req, res) {
  let id = req.params.id;

  if (webhookData[id]) {
    throw new Error(`ID must be unique. ${id} is already used!`);
  }

  webhookData[id] = req.body;

  res.status(200);
});

function start () {
  return new Promise((resolve) => {
    if (server) {
      resolve();
      return;
    }
    server = app.listen(PORT, resolve);
  });
}

function close () {
  if (!server) {
    return;
  }
  server.close();
}

function getWebhookData (id) {
  return webhookData[id];
}

module.exports = {
  start,
  close,
  getWebhookData,
  port: PORT,
};
