var express = require('express');
var router = express.Router();
var dataexport = require('../controllers/api-v2/dataexport');
var auth = require('../controllers/api-v2/auth');
var nconf = require('nconf');
var i18n = require('../libs/api-v2/i18n');

const BASE_URL = nconf.get('BASE_URL');

/* Data export deprecated routes */
// TODO remove once api v2 is taken down
router.get('/history.csv', (req, res) => {
  res.redirect(`${BASE_URL}/api/v3/export/history.csv`);
});
router.get('/userdata.xml', (req, res) => {
  res.redirect(`${BASE_URL}/api/v3/export/userdata.xml`);
});
router.get('/userdata.json', (req, res) => {
  res.redirect(`${BASE_URL}/api/v3/export/userdata.json`);
});
router.get('/avatar-:uuid.html', (req, res) => {
  res.redirect(`${BASE_URL}/api/v3/export/avatar-${req.params.uuid}.html`);
});
router.get('/avatar-:uuid.png', (req, res) => {
  res.redirect(`${BASE_URL}/api/v3/export/avatar-${req.params.uuid}.png`);
});

module.exports = router;
