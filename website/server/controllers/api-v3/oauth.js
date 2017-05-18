import {
  authWithHeaders,
} from '../../middlewares/auth';
import {
  model as User,
} from '../../models/user';
import _ from 'lodash';
import { OAuthClients } from '../../models/oauth';
import { removeFromArray } from '../../libs/collectionManipulators';
import { server, authorization } from '../../libs/oauth'
import locals from '../../middlewares/locals';
import passport from 'passport';
import { ensureLoggedIn } from 'connect-ensure-login';

let api = {};

api.getClients = {
  method: 'GET',
  url: '/oauth/clients',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    //let clients = await OAuthClients.find({'userId':user._id}).exec();
    res.respond(200, user.oauth.clients);
  },
};

api.createClient = {
  method: 'POST',
  url: '/oauth/client',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody({
      redirectUri: {notEmpty: {errorMessage: res.t('missingRedirectUris')}},
      clientName: {notEmpty: {errorMessage: res.t('missingClientName')}}
    });
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let { redirectUri, clientName } = req.body;

    user.oauth.clients.push(OAuthClients.sanitize({'clientName':clientName, 'redirectUri':redirectUri }));
    let savedUser = await user.save();

    let l = savedUser.oauth.clients.length;
    let client = savedUser.oauth.clients[l - 1];
    res.respond(200, client);
  },
};

api.deleteClient = {
  method: 'DELETE',
  url: '/oauth/client/:clientId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('clientId', res.t('clientIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let client = removeFromArray(user.oauth.clients, { clientId: req.params.clientId });
    if (!client) throw new NotFound(res.t('clientNotFound'));

    await user.save();
    res.respond(200, {});
  },
};

api.login = {
  method: 'GET',
  url: '/oauth/login',
  middlewares: [locals],
  async handler (req, res) {
    res.render('auth/login.jade', { env:res.locals.habitrpg });
  }
};

api.loginPost = {
  method: 'POST',
  url: '/oauth/login',
  middlewares: [
    passport.authenticate('local',{ successReturnToOrRedirect: '/', failureRedirect: '/api/v3/oauth/login' })
  ],
  async handler (req, res) {
    
  }
};

api.authorization = {
  method: 'GET',
  url: '/oauth/authorization',
  middlewares: [
    ensureLoggedIn('/api/v3/oauth/login'),
    authorization(),
    locals
  ],
  async handler (req, res) {
    res.render('auth/dialog.jade', { env:res.locals.habitrpg, user: req.user, oauth2:req.oauth2 });
  }
};

api.decision = {
  method: 'POST',
  url: '/oauth/authorization/decision',
  middlewares: [
    ensureLoggedIn('/api/v3/oauth/login'),
    server.decision()
  ],
  async handler (req, res) {
    //console.log(server.decision);
  }
};

api.token = {
  method: 'POST',
  url: '/oauth/token',
  middlewares: [
    passport.authenticate('oauth2-client-password', { session: false }),
    server.token(),
    server.errorHandler(),
  ],
  async handler (req, res) {
    //console.log(server.decision);
  }
};

module.exports = api;