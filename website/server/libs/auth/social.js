import passport from 'passport';
import common from '../../../common';
import { BadRequest, NotAuthorized } from '../errors';
import logger from '../logger';
import {
  generateUsername,
  loginRes,
} from './utils';
import { appleProfile } from './apple';
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

export async function socialEmailToLocal (user) {
  const socialEmail = (user.auth.google && user.auth.google.emails
    && user.auth.google.emails[0].value)
    || (user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0].value)
    || (user.auth.apple && user.auth.apple.emails && user.auth.apple.emails[0].value);
  if (socialEmail) {
    const conflictingUser = await User.findOne(
      { 'auth.local.email': socialEmail },
      { _id: 1 },
    ).exec();
    if (!conflictingUser) return socialEmail;
  }
  return undefined;
}

export async function loginSocial (req, res) { // eslint-disable-line import/prefer-default-export
  let existingUser = res.locals.user;
  const { network } = req.body;

  const isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS
    .find(supportedNetwork => supportedNetwork.key === network);
  if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));

  let profile = {};
  if (network === 'apple') {
    profile = await appleProfile(req);
  } else {
    const accessToken = req.body.authResponse.access_token;
    profile = await _passportProfile(network, accessToken);
  }

  if (!profile.id) throw new BadRequest(res.t('invalidData'));

  let user = await User.findOne({
    [`auth.${network}.id`]: profile.id,
  }, { _id: 1, apiToken: 1, auth: 1 }).exec();

  // User already signed up
  if (user) {
    if (existingUser) {
      throw new NotAuthorized(res.t('socialAlreadyExists'));
    }
    if (!user.auth.local.email) {
      user.auth.local.email = await socialEmailToLocal(user);
      if (user.auth.local.email) {
        await user.save();
      }
    }
    return loginRes(user, req, res);
  }

  let email;
  if (profile.emails && profile.emails[0] && profile.emails[0].value) {
    email = profile.emails[0].value.toLowerCase();
  }

  if (!existingUser && email) {
    existingUser = await User.findOne({ 'auth.local.email': email }).exec();
  }

  if (existingUser) {
    existingUser.auth[network] = {
      id: profile.id,
      emails: profile.emails,
    };
    user = existingUser;
  } else {
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
          email,
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
    user = new User(user);
    user.registeredThrough = req.headers['x-client']; // Not saved, used to create the correct tasks based on the device used
  }

  const savedUser = await user.save();

  if (!existingUser) {
    savedUser.newUser = true;
  }

  const response = loginRes(savedUser, req, res);

  // Clean previous email preferences
  if (email) {
    EmailUnsubscription
      .remove({ email })
      .exec()
      .then(() => {
        if (!existingUser) {
          if (savedUser._ABtests && savedUser._ABtests.welcomeEmailSplit) {
            sendTxnEmail(savedUser, savedUser._ABtests.welcomeEmailSplit);
          } else {
            sendTxnEmail(savedUser, 'welcome');
          }
        }
      })
      .catch(err => logger.error(err)); // eslint-disable-line max-nested-callbacks
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

  return response;
}
