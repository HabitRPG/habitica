/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/client';
import logger from './logger';
import { TAVERN_ID } from '../models/group';
import nconf from 'nconf';

const SLACK_FLAGGING_URL = nconf.get('SLACK:FLAGGING_URL');
const SLACK_FLAGGING_FOOTER_LINK = nconf.get('SLACK:FLAGGING_FOOTER_LINK');
const SLACK_SUBSCRIPTIONS_URL = nconf.get('SLACK:SUBSCRIPTIONS_URL');
const BASE_URL = nconf.get('BASE_URL');

let flagSlack;
let subscriptionSlack;

try {
  flagSlack = new IncomingWebhook(SLACK_FLAGGING_URL);
  subscriptionSlack = new IncomingWebhook(SLACK_SUBSCRIPTIONS_URL);
} catch (err) {
  logger.error(err);
}

function sendFlagNotification ({
  authorEmail,
  flagger,
  group,
  message,
}) {
  if (!SLACK_FLAGGING_URL) {
    return;
  }
  let titleLink;
  let authorName;
  let title = `Flag in ${group.name}`;
  let text = `${flagger.profile.name} (${flagger.id}) flagged a message (language: ${flagger.preferences.language})`;

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

  flagSlack.send({
    text,
    attachments: [{
      fallback: 'Flag Message',
      color: 'danger',
      author_name: authorName,
      title,
      title_link: titleLink,
      text: message.text,
      footer: `<${SLACK_FLAGGING_FOOTER_LINK}?groupId=${group.id}&chatId=${message.id}|Flag this message>`,
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
  if (!SLACK_SUBSCRIPTIONS_URL) {
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

module.exports = {
  sendFlagNotification,
  sendSubscriptionNotification,
};

function sendSlurNotification ({
  authorEmail,
  author,
  group,
  message,
}) {
  if (!SLACK_FLAGGING_URL) {
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
      // What to replace the footer with?
      // footer: `<${SLACK_FLAGGING_FOOTER_LINK}?groupId=${group.id}&chatId=${message.id}|Flag this message>`,
      mrkdwn_in: [
        'text',
      ],
    }],
  });
}

module.exports = {
  sendFlagNotification, sendSubscriptionNotification, sendSlurNotification,
};
