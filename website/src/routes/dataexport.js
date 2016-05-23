var express = require('express');
var router = express.Router();
var dataexport = require('../controllers/dataexport');
var auth = require('../controllers/api-v2/auth');
var nconf = require('nconf');
var i18n = require('../libs/i18n');
var locals = require('../middlewares/locals');

/* Data export */
router.get('/history.csv',auth.authWithSession,i18n.getUserLanguage,dataexport.history); //[todo] encode data output options in the data controller and use these to build routes
router.get('/userdata.xml',auth.authWithSession,i18n.getUserLanguage,dataexport.leanuser,dataexport.userdata.xml);
router.get('/userdata.json',auth.authWithSession,i18n.getUserLanguage,dataexport.leanuser,dataexport.userdata.json);
router.get('/avatar-:uuid.html', i18n.getUserLanguage, locals, dataexport.avatarPage);
router.get('/avatar-:uuid.png', i18n.getUserLanguage, locals, dataexport.avatarImage);

module.exports = router;
