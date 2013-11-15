var express = require('express');
var router = new express.Router();
var dataexport = require('../controllers/dataexport');
var nconf = require('nconf');

/* Data export */
router.get('/history.csv',dataexport.auth,dataexport.history); //[todo] encode data output options in the data controller and use these to build routes

module.exports = router;