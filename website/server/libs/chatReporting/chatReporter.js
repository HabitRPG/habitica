import { getGroupUrl, getUserInfo } from '../email';
import { getAuthorEmailFromMessage } from '../chat';

export default class ChatReporter {
  constructor (req, res) {
    this.req = req;
    this.res = res;
  }

  async validate () { // eslint-disable-line class-methods-use-this
    throw new Error('Not implemented');
  }

  async getMessageVariables (group, message) {
    const reporterEmail = getUserInfo(this.user, ['email']).email;

    const authorVariables = await this.getAuthorVariables(message);
    const groupUrl = getGroupUrl(group);

    return [
      { name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString() },
      { name: 'MESSAGE_TEXT', content: message.text },

      { name: 'REPORTER_DISPLAY_NAME', content: this.user.profile.name },
      { name: 'REPORTER_USERNAME', content: this.user.auth.local.username },
      { name: 'REPORTER_UUID', content: this.user._id },
      { name: 'REPORTER_EMAIL', content: reporterEmail },
      { name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${this.user._id}` },

      ...authorVariables,

      { name: 'GROUP_NAME', content: group.name },
      { name: 'GROUP_TYPE', content: group.type },
      { name: 'GROUP_ID', content: group._id },
      { name: 'GROUP_URL', content: groupUrl || 'N/A' },
    ];
  }

  createGenericAuthorVariables (prefix, { // eslint-disable-line class-methods-use-this
    user, username, uuid, email,
  }) {
    return [
      { name: `${prefix}_DISPLAY_NAME`, content: user },
      { name: `${prefix}_USERNAME`, content: username },
      { name: `${prefix}_UUID`, content: uuid },
      { name: `${prefix}_EMAIL`, content: email },
      { name: `${prefix}_MODAL_URL`, content: `/static/front/#?memberId=${uuid}` },
    ];
  }

  async getAuthorVariables (message) {
    this.authorEmail = await getAuthorEmailFromMessage(message);
    return this.createGenericAuthorVariables('AUTHOR', {
      user: message.user,
      username: message.username,
      uuid: message.uuid,
      email: this.authorEmail,
    });
  }

  async flag () { // eslint-disable-line class-methods-use-this
    throw new Error('Flag must be implemented');
  }
}
