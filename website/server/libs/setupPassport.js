import passport from 'passport';
import nconf from 'nconf';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import _ from 'lodash';
import validator from 'validator';
import * as passwordUtils from './password';
import { model as User } from '../models/user';
import { BasicStrategy } from 'passport-http';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import {
  NotAuthorized
} from './errors';
import { checkCredentials } from './auth'
import moment from 'moment';

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(checkCredentials));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser((user, done) => {
  return done(null, user._id);
});
passport.deserializeUser((userId, done) => {
  User.findOne({_id: userId}).exec().then((user)=>{
    return done(null, user);
  }).catch(done);
});

// TODO remove?
// This auth strategy is no longer used. It's just kept around for auth.js#loginFacebook() (passport._strategies.facebook.userProfile)
// The proper fix would be to move to a general OAuth module simply to verify accessTokens
passport.use(new FacebookStrategy({
  clientID: nconf.get('FACEBOOK_KEY'),
  clientSecret: nconf.get('FACEBOOK_SECRET'),
  // callbackURL: nconf.get("BASE_URL") + "/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.use(new GoogleStrategy({
  clientID: nconf.get('GOOGLE_CLIENT_ID'),
  clientSecret: nconf.get('GOOGLE_CLIENT_SECRET'),
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

/**
 * Oauth setup
 */

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
function verifyClient(clientId, clientSecret, done) {
  User.findOne({'oauth.clients.clientId': clientId}).exec().then((user)=>{
    if (!user) return done(null, false);
    let client = _.find(user.oauth.clients, {clientId: clientId});
    if (client.clientSecret !== clientSecret) return done(null, false);
    return done(null, client);
  }).catch(done);
}

passport.use(new ClientPasswordStrategy(verifyClient));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
  (accessToken, done) => {
    User.findOne({'oauth.tokens.accessToken': accessToken}).exec().then((user)=>{
      if (!user) throw new NotAuthorized();//return done(null, false);
      let token = _.find(user.oauth.tokens, {accessToken: accessToken});
      if(moment().isAfter(token.accessTokenExpiresOn)) {
        throw new NotAuthorized('Access token expired');
      }
      done(null, user, { accessToken: token, scope: token.scope });
    }).catch(done);
  }
));