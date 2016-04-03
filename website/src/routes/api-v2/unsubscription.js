var express = require('express');
var router = express.Router();
var i18n = require('../../libs/api-v2/i18n');
var unsubscription = require('../../controllers/api-v2/unsubscription');

router.get('/unsubscribe', i18n.getUserLanguage, unsubscription.unsubscribe);

module.exports = router;
