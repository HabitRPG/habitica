var express = require('express');
var router = new express.Router();
var dataexport = require('../controllers/dataexport');
var auth = require('../controllers/auth');
var nconf = require('nconf');

/* Data export */
router.get('/history.csv',auth.authWithSession,dataexport.history); //[todo] encode data output options in the data controller and use these to build routes
router.get('/userdata.xml',auth.authWithSession,dataexport.leanuser,dataexport.userdata.xml);
router.get('/userdata.json',auth.authWithSession,dataexport.leanuser,dataexport.userdata.json);

module.exports = router;
