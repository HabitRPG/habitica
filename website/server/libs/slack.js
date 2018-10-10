/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/client';
import logger from './logger';
import { TAVERN_ID } from '../models/group';
import nconf from 'nconf';
import moment from 'moment';

const SLACK_FLAGGING_URL = nconf.get('SLACK:FLAGGING_URL');
const SLACK_FLAGGING_FOOTER_LINK = nconf.get('SLACK:FLAGGING_FOOTER_LINK');
const SLACK_SUBSCRIPTIONS_URL = nconf.get('SLACK:SUBSCRIPTIONS_URL');
const BASE_URL = nconf.get('BASE_URL');
const IS_PRODUCTION = nconf.get('IS_PROD');

const SKIP_FLAG_METHODS = IS_PRODUCTION && !SLACK_FLAGGING_URL;
const SKIP_SUB_METHOD = IS_PRODUCTION && !SLACK_SUBSCRIPTIONS_URL;

let flagSlack;
let subscriptionSlack;

try {
  flagSlack = new IncomingWebhook(SLACK_FLAGGING_URL);
  subscriptionSlack = new IncomingWebhook(SLACK_SUBSCRIPTIONS_URL);
} catch (err) {
  logger.error(err);

  if (!IS_PRODUCTION) {
    flagSlack = subscriptionSlack = {
      send (data) {
        logger.info('Data sent to slack', data);
      },
    };
  }
}

function sendFlagNotification ({
  authorEmail,
  flagger,
  group,
  message,
  userComment,
  automatedComment,
}) {
  if (SKIP_FLAG_METHODS) {
    return;
  }
  let titleLink;
  let authorName;
  let title = `Flag in ${group.name}`;
  let text = `${flagger.profile.name} (${flagger.id}; language: ${flagger.preferences.language}) flagged a group message`;
  let footer = `<${SLACK_FLAGGING_FOOTER_LINK}?groupId=${group.id}&chatId=${message.id}|Flag this message.>`;

  if (userComment) {
    text += ` and commented: ${userComment}`;
  }
  if (automatedComment) {
    footer += ` ${automatedComment}`;
  }

  if (group.id === TAVERN_ID) {
    titleLink = `${BASE_URL}/groups/tavern`;
  } else if (group.privacy === 'public') {
    titleLink = `${BASE_URL}/groups/guild/${group.id}`;
  } else {
    title += ` - (${group.privacy} ${group.type})`;
  }

  if (!message.user && message.uuid === 'system') {
    authorName = 'System Message';
  } else {
    authorName = `${message.user} - ${authorEmail} - ${message.uuid}`;
  }

  const timestamp = `${moment(message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

  flagSlack.send({
    text,
    attachments: [{
      fallback: 'Flag Message',
      color: 'danger',
      author_name: `${authorName}\n${timestamp}`,
      title,
      title_link: titleLink,
      text: message.text,
      footer,
      mrkdwn_in: [
        'text',
      ],
    }],
  });
}

function formatUser (name, email, uuid) {
  return `${name} (${email}; ${uuid}`;
}

function sendInboxFlagNotification ({
  authorEmail,
  flagger,
  message,
  userComment,
}) {
  if (SKIP_FLAG_METHODS) {
    return;
  }
  let titleLink;
  let authorName;
  let title = `Flag in ${flagger.profile.name}'s Inbox`;
  let text = `${flagger.profile.name} (${flagger.id}; language: ${flagger.preferences.language}) flagged a PM`;
  let footer = '';

  if (userComment) {
    text += ` and commented: ${userComment}`;
  }

  let messageText = message.text;
  let sender = '';
  let recipient = '';

  const flaggerFormat = formatUser(flagger.profile.name, flagger.auth.local.email, flagger._id);
  const messageUserFormat = formatUser(message.user, authorEmail, message.uuid);

  if (message.sent) {
    sender = flaggerFormat;
    recipient = messageUserFormat;
  } else {
    sender = messageUserFormat;
    recipient = flaggerFormat;
  }

  authorName = `${sender} is writing this message to ${recipient}.`;

  flagSlack.send({
    text,
    attachments: [{
      fallback: 'Flag Message',
      color: 'danger',
      author_name: authorName,
      title,
      title_link: titleLink,
      text: messageText,
      footer,
      mrkdwn_in: [
        'text',
      ],
    }],
  });
}

function sendSubscriptionNotification ({
  buyer,
  recipient,
  paymentMethod,
  months,
  groupId,
}) {
  if (SKIP_SUB_METHOD) {
    return;
  }
  let text;
  let timestamp = new Date();
  if (recipient.id) {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a ${months}-month gift subscription for ${recipient.name} ${recipient.id} ${recipient.email} using ${paymentMethod} on ${timestamp}`;
  } else if (groupId) {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a 1-month recurring group-plan for ${groupId} using ${paymentMethod} on ${timestamp}`;
  } else {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a ${months}-month recurring subscription using ${paymentMethod} on ${timestamp}`;
  }

  subscriptionSlack.send({
    text,
  });
}

function sendSlurNotification ({
  authorEmail,
  author,
  group,
  message,
}) {
  if (SKIP_FLAG_METHODS) {
    return;
  }
  let titleLink;
  let authorName;
  let title = `Slur in ${group.name}`;
  let text = `${author.profile.name} (${author._id}) tried to post a slur`;

  if (group.id === TAVERN_ID) {
    titleLink = `${BASE_URL}/groups/tavern`;
  } else if (group.privacy === 'public') {
    titleLink = `${BASE_URL}/groups/guild/${group.id}`;
  } else {
    title += ` - (${group.privacy} ${group.type})`;
  }

  authorName = `${author.profile.name} - ${authorEmail} - ${author.id}`;

  flagSlack.send({
    text,
    attachments: [{
      fallback: 'Slur Message',
      color: 'danger',
      author_name: authorName,
      title,
      title_link: titleLink,
      text: message,
      mrkdwn_in: [
        'text',
      ],
    }],
  });
}

module.exports = {
  sendFlagNotification,
  sendInboxFlagNotification,
  sendSubscriptionNotification,
  sendSlurNotification,
};
