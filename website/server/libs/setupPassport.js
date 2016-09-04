import passport from 'passport';
import nconf from 'nconf';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

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
