/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/webhook';
import requireAgain from 'require-again';
import nconf from 'nconf';
import moment from 'moment';
import * as slack from '../../../../website/server/libs/slack';
import logger from '../../../../website/server/libs/logger';
import { TAVERN_ID } from '../../../../website/server/models/group';

describe('slack', () => {
  describe('sendFlagNotification', () => {
    let data;

    beforeEach(() => {
      sandbox.stub(IncomingWebhook.prototype, 'send').returns(Promise.resolve());
      data = {
        authorEmail: 'author@example.com',
        flagger: {
          id: 'flagger-id',
          profile: {
            name: 'flagger',
          },
          preferences: {
            language: 'flagger-lang',
          },
        },
        group: {
          id: 'group-id',
          privacy: 'private',
          name: 'Some group',
          type: 'guild',
        },
        message: {
          id: 'chat-id',
          username: 'author',
          user: 'Author',
          uuid: 'author-id',
          text: 'some text',
        },
      };
    });

    afterEach(() => {
      IncomingWebhook.prototype.send.restore();
    });

    it('sends a slack webhook', () => {
      slack.sendFlagNotification(data);

      const timestamp = `${moment(data.message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

      expect(IncomingWebhook.prototype.send).to.be.calledOnce;
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: 'flagger (flagger-id; language: flagger-lang) flagged a group message',
        attachments: [{
          fallback: 'Flag Message',
          color: 'danger',
          author_name: `@author Author (author@example.com; author-id)\n${timestamp}`,
          title: 'Flag in Some group - (private guild)',
          title_link: undefined,
          text: 'some text',
          footer: sandbox.match(/<.*?groupId=group-id&chatId=chat-id\|Flag this message.>/),
          mrkdwn_in: [
            'text',
          ],
        }],
      });
    });

    it('includes a title link if guild is public', () => {
      data.group.privacy = 'public';

      slack.sendFlagNotification(data);

      expect(IncomingWebhook.prototype.send).to.be.calledWithMatch({
        attachments: [sandbox.match({
          title: 'Flag in Some group',
          title_link: sandbox.match(/.*\/groups\/guild\/group-id/),
        })],
      });
    });

    it('links to tavern', () => {
      data.group.privacy = 'public';
      data.group.name = 'Tavern';
      data.group.id = TAVERN_ID;

      slack.sendFlagNotification(data);

      expect(IncomingWebhook.prototype.send).to.be.calledWithMatch({
        attachments: [sandbox.match({
          title: 'Flag in Tavern',
          title_link: sandbox.match(/.*\/groups\/tavern/),
        })],
      });
    });

    it('provides name for system message', () => {
      data.message.uuid = 'system';
      delete data.message.user;

      slack.sendFlagNotification(data);

      const timestamp = `${moment(data.message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

      expect(IncomingWebhook.prototype.send).to.be.calledWithMatch({
        attachments: [sandbox.match({
          author_name: `System Message\n${timestamp}`,
        })],
      });
    });

    it('noops if no flagging url is provided', () => {
      sandbox.stub(nconf, 'get').withArgs('SLACK_FLAGGING_URL').returns('');
      nconf.get.withArgs('IS_TEST').returns(true);
      sandbox.stub(logger, 'error');
      const reRequiredSlack = requireAgain('../../../../website/server/libs/slack');

      expect(logger.error).to.be.calledOnce;

      reRequiredSlack.sendFlagNotification(data);

      expect(IncomingWebhook.prototype.send).to.not.be.called;
    });
  });
});
