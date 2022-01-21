/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/webhook';
import nconf from 'nconf';
import moment from 'moment';
import logger from './logger';
import { getCurrentEvent } from './worldState'; // eslint-disable-line import/no-cycle
import { TAVERN_ID } from '../models/group'; // eslint-disable-line import/no-cycle

const SLACK_FLAGGING_URL = nconf.get('SLACK_FLAGGING_URL');
const SLACK_FLAGGING_FOOTER_LINK = nconf.get('SLACK_FLAGGING_FOOTER_LINK');
const SLACK_SUBSCRIPTIONS_URL = nconf.get('SLACK_SUBSCRIPTIONS_URL');
const BASE_URL = nconf.get('BASE_URL');
const IS_PRODUCTION = nconf.get('IS_PROD');
const IS_TEST = nconf.get('IS_TEST');

const SKIP_FLAG_METHODS = (IS_PRODUCTION || IS_TEST) && !SLACK_FLAGGING_URL;
const SKIP_SUB_METHOD = (IS_PRODUCTION || IS_TEST) && !SLACK_SUBSCRIPTIONS_URL;

let flagSlack;
let subscriptionSlack;

try {
  if (IS_TEST || IS_PRODUCTION) {
    flagSlack = new IncomingWebhook(SLACK_FLAGGING_URL);
    subscriptionSlack = new IncomingWebhook(SLACK_SUBSCRIPTIONS_URL);
  } else {
    subscriptionSlack = {
      // async so that it works like the original Slack send method
      async send (data) {
        logger.info('Data sent to slack', data);
      },
    };
    flagSlack = subscriptionSlack;
  }
} catch (err) {
  logger.error(err, 'Error setting up Slack.');
}

/**
 *
 * @param formatObj.name userName
 * @param formatObj.displayName displayName
 * @param formatObj.email email
 * @param formatObj.uuid uuid
 * @returns {string}
 */
function formatUser (formatObj) {
  return `@${formatObj.name} ${formatObj.displayName} (${formatObj.email}; ${formatObj.uuid})`;
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
    authorName = formatUser({
      name: message.username,
      displayName: message.user,
      email: authorEmail,
      uuid: message.uuid,
    });
  }

  const timestamp = `${moment(message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

  flagSlack
    .send({
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
    })
    .catch(err => logger.error(err, 'Error while sending flag data to Slack.'));
}

function sendInboxFlagNotification ({
  messageUserEmail,
  flagger,
  message,
  userComment,
}) {
  if (SKIP_FLAG_METHODS) {
    return;
  }
  const titleLink = '';
  const title = `Flag in ${flagger.profile.name}'s Inbox`;
  let text = `${flagger.profile.name} (${flagger.id}; language: ${flagger.preferences.language}) flagged a PM`;
  const footer = '';

  if (userComment) {
    text += ` and commented: ${userComment}`;
  }

  const messageText = message.text;
  let sender = '';
  let recipient = '';

  const flaggerFormat = formatUser({
    displayName: flagger.profile.name,
    name: flagger.auth.local.username,
    email: flagger.auth.local.email,
    uuid: flagger._id,
  });
  const messageUserFormat = formatUser({
    displayName: message.user,
    name: message.username,
    email: messageUserEmail,
    uuid: message.uuid,
  });

  if (message.sent) {
    sender = flaggerFormat;
    recipient = messageUserFormat;
  } else {
    sender = messageUserFormat;
    recipient = flaggerFormat;
  }

  const authorName = `${sender} wrote this message to ${recipient}.`;

  flagSlack
    .send({
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
    })
    .catch(err => logger.error(err, 'Error while sending flag data to Slack.'));
}

function sendSubscriptionNotification ({
  buyer,
  recipient,
  paymentMethod,
  months,
  groupId,
  autoRenews,
}) {
  if (SKIP_SUB_METHOD) {
    return;
  }
  let text;
  const timestamp = new Date();
  if (recipient.id) {
    const currentEvent = getCurrentEvent();
    const promoString = currentEvent && currentEvent.promo ? ' and got a promo' : '';
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a ${months}-month gift subscription for ${recipient.name} ${recipient.id} ${recipient.email}${promoString} using ${paymentMethod} on ${timestamp}`;
  } else if (groupId) {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a 1-month recurring group-plan for ${groupId} using ${paymentMethod} on ${timestamp}`;
  } else if (autoRenews) {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a ${months}-month recurring subscription using ${paymentMethod} on ${timestamp}`;
  } else {
    text = `${buyer.name} ${buyer.id} ${buyer.email} bought a ${months}-month non-recurring subscription using ${paymentMethod} on ${timestamp}`;
  }

  subscriptionSlack
    .send({
      text,
    })
    .catch(err => logger.error(err, 'Error while sending subscription data to Slack.'));
}

function sendShadowMutedPostNotification ({
  authorEmail,
  author,
  group,
  message,
}) {
  if (SKIP_FLAG_METHODS) {
    return;
  }
  const title = `Shadow-Muted Post in ${group.name}`;
  const text = `@${author.auth.local.username} / ${author.profile.name} posted while shadow-muted`;

  let titleLink;
  if (group.id === TAVERN_ID) {
    titleLink = `${BASE_URL}/groups/tavern`;
  } else {
    titleLink = `${BASE_URL}/groups/guild/${group.id}`;
  }

  const authorName = formatUser({
    name: author.auth.local.username,
    displayName: author.profile.name,
    email: authorEmail,
    uuid: author.id,
  });

  flagSlack
    .send({
      text,
      attachments: [{
        fallback: 'Shadow-Muted Message',
        color: 'danger',
        author_name: authorName,
        title,
        title_link: titleLink,
        text: message,
        mrkdwn_in: [
          'text',
        ],
      }],
    })
    .catch(err => logger.error(err, 'Error while sending flag data to Slack.'));
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
  const text = `${author.profile.name} (${author._id}) tried to post a slur`;

  let titleLink;
  let title = `Slur in ${group.name}`;

  if (group.id === TAVERN_ID) {
    titleLink = `${BASE_URL}/groups/tavern`;
  } else if (group.privacy === 'public') {
    titleLink = `${BASE_URL}/groups/guild/${group.id}`;
  } else {
    title += ` - (${group.privacy} ${group.type})`;
  }

  const authorName = formatUser({
    name: author.auth.local.username,
    displayName: author.profile.name,
    email: authorEmail,
    uuid: author.id,
  });

  flagSlack
    .send({
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
    })
    .catch(err => logger.error(err, 'Error while sending flag data to Slack.'));
}

export {
  sendFlagNotification,
  sendInboxFlagNotification,
  sendSubscriptionNotification,
  sendShadowMutedPostNotification,
  sendSlurNotification,
  formatUser,
};
