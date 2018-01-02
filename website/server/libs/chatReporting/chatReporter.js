import {
} from '../errors';
import { getUserInfo } from '../email';
import { getAuthorEmailFromMessage } from '../chat';

export default class ChatReporter {
  constructor (req, res) {
    this.req = req;
    this.res = res;
  }

  async validate () {}

  async notify (group, message) {
    const reporterEmailContent = getUserInfo(this.user, ['email']).email;
    this.authorEmail = await getAuthorEmailFromMessage(message);
    this.emailVariables = [
      {name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString()},
      {name: 'MESSAGE_TEXT', content: message.text},

      {name: 'REPORTER_USERNAME', content: this.user.profile.name},
      {name: 'REPORTER_UUID', content: this.user._id},
      {name: 'REPORTER_EMAIL', content: reporterEmailContent},
      {name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${this.user._id}`},

      {name: 'AUTHOR_USERNAME', content: message.user},
      {name: 'AUTHOR_UUID', content: message.uuid},
      {name: 'AUTHOR_EMAIL', content: this.authorEmail},
      {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${message.uuid}`},
    ];
  }

  async flag () {
    throw new Error('Flag must be implemented');
  }
}
