import nconf from 'nconf';
import got from 'got';
import { TAVERN_ID } from '../models/group'; // eslint-disable-line import/no-cycle
import { encrypt } from './encryption';
import logger from './logger';
import common from '../../common';

const IS_PROD = nconf.get('IS_PROD');
const EMAIL_SERVER = {
  url: nconf.get('EMAIL_SERVER_URL'),
  auth: {
    user: nconf.get('EMAIL_SERVER_AUTH_USER'),
    password: nconf.get('EMAIL_SERVER_AUTH_PASSWORD'),
  },
};
const BASE_URL = nconf.get('BASE_URL');

export function getUserInfo (user, fields = []) {
  const info = {};

  if (fields.indexOf('name') !== -1) {
    info.name = user.auth && user.auth.local.username;
  }

  if (fields.indexOf('email') !== -1) {
    if (user.auth.local && user.auth.local.email) {
      info.email = user.auth.local.email;
    } else {
      common.constants.SUPPORTED_SOCIAL_NETWORKS.forEach(network => {
        if (
          user.auth[network.key]
          && user.auth[network.key].emails
          && user.auth[network.key].emails[0]
          && user.auth[network.key].emails[0].value
        ) {
          info.email = user.auth[network.key].emails[0].value;
        }
      });
    }
  }

  if (fields.indexOf('_id') !== -1) {
    info._id = user._id;
  }

  if (fields.indexOf('canSend') !== -1) {
    if (user.preferences && user.preferences.emailNotifications) {
      info.canSend = user.preferences.emailNotifications.unsubscribeFromAll !== true;
    }
  }

  return info;
}

export function getGroupUrl (group) {
  let groupUrl;
  if (group._id === TAVERN_ID) {
    groupUrl = '/groups/tavern';
  } else if (group.type === 'guild') {
    groupUrl = `/groups/guild/${group._id}`;
  } else if (group.type === 'party') {
    groupUrl = 'party';
  }

  return groupUrl;
}

// Send a transactional email using Mandrill through the external email server
export async function sendTxn (mailingInfoArray, emailType, variables, personalVariables) {
  mailingInfoArray = Array.isArray(mailingInfoArray) ? mailingInfoArray : [mailingInfoArray]; // eslint-disable-line no-param-reassign, max-len

  variables = [ // eslint-disable-line no-param-reassign
    { name: 'BASE_URL', content: BASE_URL },
  ].concat(variables || []);

  // It's important to pass at least a user with its `preferences`
  // as we need to check if he unsubscribed
  mailingInfoArray = mailingInfoArray // eslint-disable-line no-param-reassign
    .map(mailingInfo => (mailingInfo._id ? getUserInfo(mailingInfo, ['_id', 'email', 'name', 'canSend']) : mailingInfo))
    // Always send reset-password emails
    // Don't check canSend for non registered users as already checked before
    .filter(mailingInfo => mailingInfo.email
        && (!mailingInfo._id || mailingInfo.canSend || emailType === 'reset-password'));

  // Personal variables are personal to each email recipient, if they are missing
  // we manually create a structure for them with RECIPIENT_NAME and RECIPIENT_UNSUB_URL
  // otherwise we just add RECIPIENT_NAME and RECIPIENT_UNSUB_URL to the existing personal variables
  if (!personalVariables || personalVariables.length === 0) {
    personalVariables = mailingInfoArray.map(mailingInfo => ({ // eslint-disable-line no-param-reassign, max-len
      rcpt: mailingInfo.email,
      vars: [
        {
          name: 'RECIPIENT_NAME',
          content: mailingInfo.name,
        },
        {
          name: 'RECIPIENT_UNSUB_URL',
          content: `/email/unsubscribe?code=${encrypt(JSON.stringify({
            _id: mailingInfo._id,
            email: mailingInfo.email,
          }))}`,
        },
      ],
    }));
  } else {
    const temporaryPersonalVariables = {};

    mailingInfoArray.forEach(mailingInfo => {
      temporaryPersonalVariables[mailingInfo.email] = {
        name: mailingInfo.name,
        _id: mailingInfo._id,
      };
    });

    personalVariables.forEach(singlePersonalVariables => {
      singlePersonalVariables.vars.push(
        {
          name: 'RECIPIENT_NAME',
          content: temporaryPersonalVariables[singlePersonalVariables.rcpt].name,
        },
        {
          name: 'RECIPIENT_UNSUB_URL',
          content: `/email/unsubscribe?code=${encrypt(JSON.stringify({
            _id: temporaryPersonalVariables[singlePersonalVariables.rcpt]._id,
            email: singlePersonalVariables.rcpt,
          }))}`,
        },
      );
    });
  }

  if (IS_PROD && mailingInfoArray.length > 0) {
    return got.post(`${EMAIL_SERVER.url}/job`, {
      retry: 5, // retry the http request to the email server 5 times
      timeout: 60000, // wait up to 60s before timing out
      username: EMAIL_SERVER.auth.user,
      password: EMAIL_SERVER.auth.password,
      json: {
        type: 'email',
        data: {
          emailType,
          to: mailingInfoArray,
          variables,
          personalVariables,
        },
        options: {
          priority: 'high',
          attempts: 5,
          backoff: { delay: 10 * 60 * 1000, type: 'fixed' },
        },
      },
    }).json().catch(err => logger.error(err, {
      extraMessage: 'Error while sending an email.',
      emailType,
    }));
  }

  return null;
}
