var express = require('express');
var router = new express.Router();
var nconf = require('nconf');

/* ---------- Deprecated API ------------*/

router.all('*', function deprecated(req, res, next) {
  res.json(404, {
    err: 'API v1 is no longer supported, please use API v2 instead ' + nconf.get('BASE_URL') + '/static/api'
  });
});

module.exports = router;
