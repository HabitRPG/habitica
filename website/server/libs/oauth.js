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

server.deserializeClient(async (clientId, done) => {
  let user = await User.findOne({'oauth.clients.clientId': clientId}).exec();
  if (!user) return done(false);
  let client = _.find(user.oauth.clients, {clientId: clientId});
  return done(null, client);
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

server.grant(grant.code(async (client, redirectUri, user, ares, done) => {
  console.log('code grant')
  const code = uuid();
  user.oauth.authCodes.push(OAuthCodeModel.sanitize({'accessCode':code, 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': ares.scope }));
  let savedUser = await user.save();

  //let l = savedUser.oauth.authCodes.length;
  //let authCode = savedUser.oauth.authCodes[l - 1];
  return done(null, code);
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(grant.token(async (client, user, ares, done) => {
  const token = uuid();
  user.oauth.tokens.push(OAuthTokensModel.sanitize({'accessToken':token, 'accessTokenExpiresOn':moment().add({ days: 30 }), 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': ares.scope }));
  let savedUser = await user.save();
  //let l = savedUser.oauth.tokens.length;
  //let authCode = savedUser.oauth.tokens[l - 1];
  return done(null, token);
}));

// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange('code',exchange.code(async (client, code, redirectUri, done) => {
  let user = await User.findOne({'oauth.authCodes.accessCode': code}).exec();
  if (!user) return done(null, false);
  let authCode = _.find(user.oauth.authCodes, {accessCode: code});
  //if (client.clientId !== authCode.clientId) return done(null, false);
  //if (redirectUri !== authCode.redirectUri) return done(null, false);

  const token = uuid();
  user.oauth.tokens.push(OAuthTokensModel.sanitize({'accessToken':token, 'accessTokenExpiresOn':moment().add({ days: 30 }), 'redirectUris':redirectUri, 'cliendId': client.clientId, 'scope': authCode.scope }));
  removeFromArray(user.oauth.authCodes, { accessCode: code });
  let savedUser = await user.save();

  return done(null, token);

}));

module.exports.server = server;