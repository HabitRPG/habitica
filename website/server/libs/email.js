import { createTransport } from 'nodemailer';
import nconf from 'nconf';
import { TAVERN_ID } from '../models/group';
import { encrypt } from './encryption';
import request from 'request';
import logger from './logger';
import common from '../../common';

const IS_PROD = nconf.get('IS_PROD');
const EMAIL_SERVER = {
  url: nconf.get('EMAIL_SERVER:url'),
  auth: {
    user: nconf.get('EMAIL_SERVER:authUser'),
    password: nconf.get('EMAIL_SERVER:authPassword'),
  },
};
const BASE_URL = nconf.get('BASE_URL');

let smtpTransporter = createTransport({
  service: nconf.get('SMTP_SERVICE'),
  auth: {
    user: nconf.get('SMTP_USER'),
    pass: nconf.get('SMTP_PASS'),
  },
});

// Send email directly from the server using the smtpTransporter,
// used only to send password reset emails because users unsubscribed on Mandrill wouldn't get them
export function send (mailData) {
  return smtpTransporter.sendMail(mailData); // promise
}

export function getUserInfo (user, fields = []) {
  let info = {};

  if (fields.indexOf('name') !== -1) {
    info.name = user.profile && user.profile.name;

    if (!info.name) {
      if (user.auth.local && user.auth.local.username) {
        info.name = user.auth.local.username;
      } else if (user.auth.facebook) {
        info.name = user.auth.facebook.displayName || user.auth.facebook.username;
      }
    }
  }

  if (fields.indexOf('email') !== -1) {
    if (user.auth.local && user.auth.local.email) {
      info.email = user.auth.local.email;
    } else {
      common.constants.SUPPORTED_SOCIAL_NETWORKS.forEach(network => {
        if (user.auth[network.key] && user.auth[network.key].emails && user.auth[network.key].emails[0] && user.auth[network.key].emails[0].value) {
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
    groupUrl = '/#/options/groups/tavern';
  } else if (group.type === 'guild') {
    groupUrl = `/#/options/groups/guilds/${group._id}`;
  } else if (group.type === 'party') {
    groupUrl = 'party';
  }

  return groupUrl;
}

// Send a transactional email using Mandrill through the external email server
export function sendTxn (mailingInfoArray, emailType, variables, personalVariables) {
  mailingInfoArray = Array.isArray(mailingInfoArray) ? mailingInfoArray : [mailingInfoArray];

  variables = [
    {name: 'BASE_URL', content: BASE_URL},
  ].concat(variables || []);

  // It's important to pass at least a user with its `preferences` as we need to check if he unsubscribed
  mailingInfoArray = mailingInfoArray.map((mailingInfo) => {
    return mailingInfo._id ? getUserInfo(mailingInfo, ['_id', 'email', 'name', 'canSend']) : mailingInfo;
  }).filter((mailingInfo) => {
    // Always send reset-password emails
    // Don't check canSend for non registered users as already checked before
    return mailingInfo.email && (!mailingInfo._id || mailingInfo.canSend || emailType === 'reset-password');
  });

  // Personal variables are personal to each email recipient, if they are missing
  // we manually create a structure for them with RECIPIENT_NAME and RECIPIENT_UNSUB_URL
  // otherwise we just add RECIPIENT_NAME and RECIPIENT_UNSUB_URL to the existing personal variables
  if (!personalVariables || personalVariables.length === 0) {
    personalVariables = mailingInfoArray.map((mailingInfo) => {
      return {
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
      };
    });
  } else {
    let temporaryPersonalVariables = {};

    mailingInfoArray.forEach((mailingInfo) => {
      temporaryPersonalVariables[mailingInfo.email] = {
        name: mailingInfo.name,
        _id: mailingInfo._id,
      };
    });

    personalVariables.forEach((singlePersonalVariables) => {
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
        }
      );
    });
  }

  if (IS_PROD && mailingInfoArray.length > 0) {
    request.post({
      url: `${EMAIL_SERVER.url}/job`,
      auth: {
        user: EMAIL_SERVER.auth.user,
        pass: EMAIL_SERVER.auth.password,
      },
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
          backoff: {delay: 10 * 60 * 1000, type: 'fixed'},
        },
      },
    }, (err) => logger.error(err));
  }
}
