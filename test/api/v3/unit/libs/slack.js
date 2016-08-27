/* eslint-disable camelcase */
import { IncomingWebhook } from '@slack/client';
import slack from '../../../../../website/server/libs/slack';
import { TAVERN_ID } from '../../../../../website/server/models/group';

describe('slack', () => {
  describe('sendFlagNotification', () => {
    let flagger, group, message;

    beforeEach(() => {
      sandbox.stub(IncomingWebhook.prototype, 'send');
      flagger = {
        id: 'flagger-id',
        profile: {
          name: 'flagger',
        },
      };
      group = {
        id: 'group-id',
        privacy: 'private',
        name: 'Some group',
        type: 'guild',
      };
      message = {
        id: 'chat-id',
        user: 'Author',
        uuid: 'author-id',
        text: 'some text',
      };
    });

    afterEach(() => {
      IncomingWebhook.prototype.send.restore();
    });

    it('sends a slack webhook', () => {
      slack.sendFlagNotification({
        flagger,
        group,
        message,
      });

      expect(IncomingWebhook.prototype.send).to.be.calledOnce;
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: 'flagger (flagger-id) flagged a message',
        attachments: [{
          fallback: 'Flag Message',
          color: 'danger',
          author_name: 'Author - author-id',
          title: 'Flag in Some group - (private guild)',
          title_link: undefined,
          text: 'some text',
          footer: sandbox.match(/<.*?groupId=group-id&chatId=chat-id\|Flag this message>/),
          mrkdwn_in: [
            'text',
          ],
        }],
      });
    });

    it('includes a title link if guild is public', () => {
      group.privacy = 'public';

      slack.sendFlagNotification({
        flagger,
        group,
        message,
      });

      expect(IncomingWebhook.prototype.send).to.be.calledWithMatch({
        attachments: [sandbox.match({
          title: 'Flag in Some group',
          title_link: sandbox.match(/.*\/#\/options\/groups\/guilds\/group-id/),
        })],
      });
    });

    it('links to tavern', () => {
      group.privacy = 'public';
      group.name = 'Tavern';
      group.id = TAVERN_ID;

      slack.sendFlagNotification({
        flagger,
        group,
        message,
      });

      expect(IncomingWebhook.prototype.send).to.be.calledWithMatch({
        attachments: [sandbox.match({
          title: 'Flag in Tavern',
          title_link: sandbox.match(/.*\/#\/options\/groups\/tavern/),
        })],
      });
    });
  });
});
