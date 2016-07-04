var auth = require('../../controllers/api-v2/auth');
var express = require('express');
var i18n = require('../../libs/api-v2/i18n');
var router = express.Router();
import {
  getUserLanguage
} from '../../middlewares/api-v3/language';

/* auth.auth*/
// auth.setupPassport(router); //TODO make this consistent with the others
router.post('/register', getUserLanguage, auth.registerUser);
router.post('/user/auth/local', getUserLanguage, auth.loginLocal);
router.post('/user/auth/social', getUserLanguage, auth.loginSocial);
router.delete('/user/auth/social', getUserLanguage, auth.auth, auth.deleteSocial);
router.post('/user/reset-password', getUserLanguage, auth.resetPassword);
router.post('/user/change-password', getUserLanguage, auth.auth, auth.changePassword);
router.post('/user/change-username', getUserLanguage, auth.auth, auth.changeUsername);
router.post('/user/change-email', getUserLanguage, auth.auth, auth.changeEmail);

module.exports = router;
