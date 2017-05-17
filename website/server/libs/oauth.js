import { 
    OAuthToken as OAuthTokensModel, 
    OAuthClients as OAuthClientsModel,
    OAuthCode as OAuthCodeModel
} from '../models/oauth';
import {
  model as User,
} from '../models/user';
import validator from 'validator';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { createServer, grant, exchange } from 'oauth2orize';
import { removeFromArray } from './collectionManipulators';

// Create OAuth 2.0 server
const server = createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.clientId));

server.deserializeClient((clientId, done) => {
  User.findOne({'oauth.clients.clientId': clientId}).exec().then((user)=>{
    if (!user) return done(false);
    let client = _.find(user.oauth.clients, {clientId: clientId});
    return done(null, client);
  }).catch(done);
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources. It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes. The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(grant.code((client, redirectUri, user, ares, done) => {
  const code = uuid();
  user.oauth.authCodes.push(OAuthCodeModel.sanitize({'accessCode':code, 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': ares.scope }));
  user.save().then((savedUser)=>{
    return done(null, code);
  }).catch(done);
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(grant.token((client, user, ares, done) => {
  const token = uuid();
  user.oauth.tokens.push(OAuthTokensModel.sanitize({'accessToken':token, 'accessTokenExpiresOn':moment().add({ days: 30 }), 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': ares.scope }));
  user.save().then((savedUser)=>{
    return done(null, token);
  }).catch(done);
}));

// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange('code',exchange.code((client, code, redirectUri, done) => {
  User.findOne({'oauth.authCodes.accessCode': code}).exec().then((user)=>{
    if (!user) return done(null, false);
    let authCode = _.find(user.oauth.authCodes, {accessCode: code});
    //if (client.clientId !== authCode.clientId) return done(null, false);
    //if (redirectUri !== authCode.redirectUri) return done(null, false);

    const token = uuid();
    user.oauth.tokens.push(OAuthTokensModel.sanitize({'accessToken':token, 'accessTokenExpiresOn':moment().add({ days: 30 }), 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': authCode.scope }));
    removeFromArray(user.oauth.authCodes, { accessCode: code });
    user.save().then((savedUser)=>{
      return done(null, token);
    }).catch(done);
  }).catch(done);
}));

module.exports.authorization = function(){
  return server.authorization((clientId, redirectUri, done) => {
      User.findOne({'oauth.clients.clientId': clientId}).exec().then((user)=>{
        if (!user) return done(null, false);
        let client = _.find(user.oauth.clients, {clientId: clientId});
        if (client.redirectUri !== redirectUri) { return done(null, false); }
        return done(null, client, redirectUri);
      }).catch(done);
    }, (client, user, done) => {
      // Check if grant request qualifies for immediate approval
      return done(null, false);
      // Auto-approve
      /*if (client.isTrusted) return done(null, true);
      
      db.accessTokens.findByUserIdAndClientId(user.id, client.clientId, (error, token) => {
        // Auto-approve
        if (token) return done(null, true);
        
        // Otherwise ask user
        return done(null, false);
      });*/
    });
};

module.exports.server = server;