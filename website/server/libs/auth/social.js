import passport from 'passport';
import jwt from 'jsonwebtoken';
import AppleAuth from 'apple-auth';
import nconf from 'nconf';
import common from '../../../common';
import { BadRequest } from '../errors';
import {
  generateUsername,
  loginRes,
} from './utils';
import { model as User } from '../../models/user';
import { model as EmailUnsubscription } from '../../models/emailUnsubscription';
import { sendTxn as sendTxnEmail } from '../email';

function _passportProfile (network, accessToken) {
  return new Promise((resolve, reject) => {
    passport._strategies[network].userProfile(accessToken, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        resolve(profile);
      }
    });
  });
}

const applePrivateKey = nconf.get('APPLE_AUTH_PRIVATE_KEY');
const applePublicKey = nconf.get('APPLE_AUTH_PUBLIC_KEY');

const auth = new AppleAuth(JSON.stringify({
  client_id: nconf.get('APPLE_AUTH_CLIENT_ID'), // eslint-disable-line camelcase
  team_id: nconf.get('APPLE_TEAM_ID'), // eslint-disable-line camelcase
  key_id: nconf.get('APPLE_AUTH_KEY_ID'), // eslint-disable-line camelcase
  redirect_uri: 'https://habitica.com/api/v4/user/auth/social', // eslint-disable-line camelcase
  scope: 'name email',
}), applePrivateKey.toString(), 'text');

async function _appleProfile (req) {
  let idToken = {};
  const code = req.body.code ? req.body.code : req.query.code;
  const passedToken = req.body.id_token ? req.body.id_token : req.query.id_token;
  if (code) {
    const response = await auth.accessToken(code);
    idToken = jwt.decode(response.id_token);
  } else if (passedToken) {
    idToken = await jwt.verify(passedToken, applePublicKey, { algorithms: ['RS256'] });
  }
  return {
    id: idToken.sub,
    emails: [idToken.email],
    name: idToken.name || req.body.name,
  };
}

export async function loginSocial (req, res) { // eslint-disable-line import/prefer-default-export
  const existingUser = res.locals.user;
  const { network } = req.body;

  const isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS
    .find(supportedNetwork => supportedNetwork.key === network);
  if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));

  let profile = {};
  if (network === 'apple') {
    profile = await _appleProfile(req);
  } else {
    const accessToken = req.body.authResponse.access_token;
    profile = await _passportProfile(network, accessToken);
  }

  let user = await User.findOne({
    [`auth.${network}.id`]: profile.id,
  }, { _id: 1, apiToken: 1, auth: 1 }).exec();

  // User already signed up
  if (user) {
    return loginRes(user, req, res);
  }

  const generatedUsername = generateUsername();

  user = {
    auth: {
      [network]: {
        id: profile.id,
        emails: profile.emails,
      },
      local: {
        username: generatedUsername,
        lowerCaseUsername: generatedUsername,
      },
    },
    profile: {
      name: profile.displayName || profile.name || profile.username,
    },
    preferences: {
      language: req.language,
    },
    flags: {
      verifiedUsername: true,
    },
  };

  if (existingUser) {
    existingUser.auth[network] = user.auth[network];
    user = existingUser;
  } else {
    user = new User(user);
    user.registeredThrough = req.headers['x-client']; // Not saved, used to create the correct tasks based on the device used
  }

  const savedUser = await user.save();

  if (!existingUser) {
    user.newUser = true;
  }

  loginRes(user, req, res);

  // Clean previous email preferences
  if (
    savedUser.auth[network].emails
    && savedUser.auth[network].emails[0]
    && savedUser.auth[network].emails[0].value
  ) {
    EmailUnsubscription
      .remove({ email: savedUser.auth[network].emails[0].value.toLowerCase() })
      .exec()
      .then(() => {
        if (!existingUser) {
          if (savedUser._ABtests && savedUser._ABtests.welcomeEmailSplit) {
            sendTxnEmail(savedUser, savedUser._ABtests.welcomeEmailSplit);
          } else {
            sendTxnEmail(savedUser, 'welcome');
          }
        }
      }); // eslint-disable-line max-nested-callbacks
  }

  if (!existingUser) {
    res.analytics.track('register', {
      category: 'acquisition',
      type: network,
      gaLabel: network,
      uuid: savedUser._id,
      headers: req.headers,
      user: savedUser,
    });
  }

  return null;
}
