var auth = require('../../controllers/api-v2/auth');
var express = require('express');
var i18n = require('../../libs/api-v2/i18n');
var router = express.Router();

/* auth.auth*/
// auth.setupPassport(router); //FIXME make this consistent with the others
router.post('/register', i18n.getUserLanguage, auth.registerUser);
router.post('/user/auth/local', i18n.getUserLanguage, auth.loginLocal);
router.post('/user/auth/social', i18n.getUserLanguage, auth.loginSocial);
router.delete('/user/auth/social', i18n.getUserLanguage, auth.auth, auth.deleteSocial);
router.post('/user/reset-password', i18n.getUserLanguage, auth.resetPassword);
router.post('/user/change-password', i18n.getUserLanguage, auth.auth, auth.changePassword);
router.post('/user/change-username', i18n.getUserLanguage, auth.auth, auth.changeUsername);
router.post('/user/change-email', i18n.getUserLanguage, auth.auth, auth.changeEmail);
// router.post('/user/auth/firebase', i18n.getUserLanguage, auth.auth, auth.getFirebaseToken);

module.exports = router;
