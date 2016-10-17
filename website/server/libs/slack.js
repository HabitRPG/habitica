/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/client';
import logger from './logger';
import { TAVERN_ID } from '../models/group';
import nconf from 'nconf';

const SLACK_FLAGGING_URL = nconf.get('SLACK:FLAGGING_URL');
const SLACK_FLAGGING_FOOTER_LINK = nconf.get('SLACK:FLAGGING_FOOTER_LINK');
const BASE_URL = nconf.get('BASE_URL');

let flagSlack;

try {
  flagSlack = new IncomingWebhook(SLACK_FLAGGING_URL);
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
  let text = `${flagger.profile.name} (${flagger.id}) flagged a message`;

  if (group.id === TAVERN_ID) {
    titleLink = `${BASE_URL}/#/options/groups/tavern`;
  } else if (group.privacy === 'public') {
    titleLink = `${BASE_URL}/#/options/groups/guilds/${group.id}`;
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

module.exports = {
  sendFlagNotification,
};
