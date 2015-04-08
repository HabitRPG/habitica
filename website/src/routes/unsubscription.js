var express = require('express');
var router = new express.Router();
var i18n = require('../i18n');
var unsubscription = require('../controllers/unsubscription');

router.get('/unsubscribe', i18n.getUserLanguage, unsubscription.unsubscribe);

module.exports = router;