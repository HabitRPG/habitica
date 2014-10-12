var auth = require('../controllers/auth');
var express = require('express');
var i18n = require('../i18n');
var router = new express.Router();

/* auth.auth*/
auth.setupPassport(router); //FIXME make this consistent with the others
router.post('/api/v2/register', i18n.getUserLanguage, auth.registerUser);
router.post('/api/v2/user/auth/local', i18n.getUserLanguage, auth.loginLocal);
router.post('/api/v2/user/auth/facebook', i18n.getUserLanguage, auth.loginFacebook);
router.post('/api/v2/user/reset-password', i18n.getUserLanguage, auth.resetPassword);
router.post('/api/v2/user/change-password', i18n.getUserLanguage, auth.auth, auth.changePassword);
router.post('/api/v2/user/change-username', i18n.getUserLanguage, auth.auth, auth.changeUsername);

router.post('/api/v1/register', i18n.getUserLanguage, auth.registerUser);
router.post('/api/v1/user/auth/local', i18n.getUserLanguage, auth.loginLocal);
router.post('/api/v1/user/auth/facebook', i18n.getUserLanguage, auth.loginFacebook);

module.exports = router;