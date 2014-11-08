var express = require('express');
var router = new express.Router();
var dataexport = require('../controllers/dataexport');
var auth = require('../controllers/auth');
var nconf = require('nconf');
var i18n = require('../i18n')

/* Data export */
router.get('/history.csv',auth.authWithSession,i18n.getUserLanguage,dataexport.history); //[todo] encode data output options in the data controller and use these to build routes
router.get('/userdata.xml',auth.authWithSession,i18n.getUserLanguage,dataexport.leanuser,dataexport.userdata.xml);
router.get('/userdata.json',auth.authWithSession,i18n.getUserLanguage,dataexport.leanuser,dataexport.userdata.json);

module.exports = router;
