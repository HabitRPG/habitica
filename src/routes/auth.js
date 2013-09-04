var auth = require('../controllers/auth');
var express = require('express');
var router = new express.Router();

/* auth.auth*/
auth.setupPassport(router); //FIXME make this consistent with the others
router.post('/register', auth.registerUser);
router.post('/user/auth/local', auth.loginLocal);
router.post('/user/auth/facebook', auth.loginFacebook);

module.exports = router;