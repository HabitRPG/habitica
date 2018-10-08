import passport from 'passport';
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

async function loginSocial (req, res) {
  const existingUser = res.locals.user;
  const accessToken = req.body.authResponse.access_token;
  const network = req.body.network;

  const isSupportedNetwork = common.constants.SUPPORTED_SOCIAL_NETWORKS.find(supportedNetwork => {
    return supportedNetwork.key === network;
  });
  if (!isSupportedNetwork) throw new BadRequest(res.t('unsupportedNetwork'));

  const profile = await _passportProfile(network, accessToken);

  let user = await User.findOne({
    [`auth.${network}.id`]: profile.id,
  }, {_id: 1, apiToken: 1, auth: 1}).exec();

  // User already signed up
  if (user) {
    return loginRes(user, ...arguments);
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

  loginRes(user, ...arguments);

  // Clean previous email preferences
  if (savedUser.auth[network].emails && savedUser.auth[network].emails[0] && savedUser.auth[network].emails[0].value) {
    EmailUnsubscription
      .remove({email: savedUser.auth[network].emails[0].value.toLowerCase()})
      .exec()
      .then(() => {
        if (!existingUser) sendTxnEmail(savedUser, 'welcome');
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

module.exports = {
  loginSocial,
};
