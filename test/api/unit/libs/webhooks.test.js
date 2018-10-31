import got from 'got';
import {
  WebhookSender,
  taskScoredWebhook,
  groupChatReceivedWebhook,
  taskActivityWebhook,
  questActivityWebhook,
  userActivityWebhook,
} from '../../../../website/server/libs/webhook';
import {
  model as User,
} from '../../../../website/server/models/user';
import {
  generateUser,
} from '../../../helpers/api-unit.helper.js';
import { defer } from '../../../helpers/api-unit.helper';

describe('webhooks', () => {
  let webhooks, user;

  beforeEach(() => {
    sandbox.stub(got, 'post').returns(defer().promise);

    webhooks = [{
      id: 'taskActivity',
      url: 'http://task-scored.com',
      enabled: true,
      type: 'taskActivity',
      options: {
        created: true,
        updated: true,
        deleted: true,
        scored: true,
        checklistScored: true,
      },
    }, {
      id: 'questActivity',
      url: 'http://quest-activity.com',
      enabled: true,
      type: 'questActivity',
      options: {
        questStarted: true,
        questFinised: true,
      },
    }, {
      id: 'userActivity',
      url: 'http://user-activity.com',
      enabled: true,
      type: 'userActivity',
      options: {
        petHatched: true,
        mountRaised: true,
        leveledUp: true,
      },
    }, {
      id: 'groupChatReceived',
      url: 'http://group-chat-received.com',
      enabled: true,
      type: 'groupChatReceived',
      options: {
        groupId: 'group-id',
      },
    }];

    user = generateUser();
    user.webhooks = webhooks;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('WebhookSender', () => {
    it('creates a new WebhookSender object', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      expect(sendWebhook.type).to.equal('custom');
      expect(sendWebhook).to.respondTo('send');
    });

    it('provides default function for data transformation', () => {
      sandbox.spy(WebhookSender, 'defaultTransformData');
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultTransformData).to.be.calledOnce;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: true,
        body,
      });
    });

    it('adds default data (user and webhookType) to the body', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });
      sandbox.spy(sendWebhook, 'attachDefaultData');

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(sendWebhook.attachDefaultData).to.be.calledOnce;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: true,
      });

      expect(body).to.eql({
        foo: 'bar',
        user: {_id: user._id},
        webhookType: 'custom',
      });
    });

    it('can pass in a data transformation function', () => {
      sandbox.spy(WebhookSender, 'defaultTransformData');
      let sendWebhook = new WebhookSender({
        type: 'custom',
        transformData (data) {
          let dataToSend = Object.assign({baz: 'biz'}, data);

          return dataToSend;
        },
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultTransformData).to.not.be.called;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: true,
        body: {
          foo: 'bar',
          baz: 'biz',
        },
      });
    });

    it('provides a default filter function', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultWebhookFilter).to.be.calledOnce;
    });

    it('can pass in a webhook filter function', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      let sendWebhook = new WebhookSender({
        type: 'custom',
        webhookFilter (hook) {
          return hook.url !== 'http://custom-url.com';
        },
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultWebhookFilter).to.not.be.called;
      expect(got.post).to.not.be.called;
    });

    it('can pass in a webhook filter function that filters on data', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      let sendWebhook = new WebhookSender({
        type: 'custom',
        webhookFilter (hook, data) {
          return hook.options.foo === data.foo;
        },
      });

      let body = { foo: 'bar' };

      user.webhooks = [
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom', options: { foo: 'bar' }},
        { id: 'other-custom-webhook', url: 'http://other-custom-url.com', enabled: true, type: 'custom', options: { foo: 'foo' }},
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com');
    });

    it('ignores disabled webhooks', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'http://custom-url.com', enabled: false, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(got.post).to.not.be.called;
    });

    it('ignores webhooks with invalid urls', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [{id: 'custom-webhook', url: 'httxp://custom-url!!!', enabled: true, type: 'custom'}];
      sendWebhook.send(user, body);

      expect(got.post).to.not.be.called;
    });

    it('ignores webhooks of other types', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'},
        { id: 'other-webhook', url: 'http://other-url.com', enabled: true, type: 'other'},
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        body,
        json: true,
      });
    });

    it('sends every type of activity to global webhooks', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [
        { id: 'global-webhook', url: 'http://custom-url.com', enabled: true, type: 'globalActivity'},
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        body,
        json: true,
      });
    });

    it('sends multiple webhooks of the same type', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      user.webhooks = [
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'},
        { id: 'other-custom-webhook', url: 'http://other-url.com', enabled: true, type: 'custom'},
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledTwice;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        body,
        json: true,
      });
      expect(got.post).to.be.calledWithMatch('http://other-url.com', {
        body,
        json: true,
      });
    });
  });

  describe('taskScoredWebhook', () => {
    let data;

    beforeEach(() => {
      data = {
        user: {
          _tmp: {foo: 'bar'},
          stats: {
            lvl: 5,
            int: 10,
            str: 5,
            exp: 423,
            toJSON () {
              return this;
            },
          },
        },
        task: {
          text: 'text',
        },
        direction: 'up',
        delta: 176,
      };

      let mockStats = Object.assign({
        maxHealth: 50,
        maxMP: 103,
        toNextLevel: 40,
      }, data.user.stats);
      delete mockStats.toJSON;

      sandbox.stub(User, 'addComputedStatsToJSONObj').returns(mockStats);
    });

    it('sends task and stats data', () => {
      taskScoredWebhook.send(user, data);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch(webhooks[0].url, {
        json: true,
        body: {
          type: 'scored',
          webhookType: 'taskActivity',
          user: {
            _id: user._id,
            _tmp: {foo: 'bar'},
            stats: {
              lvl: 5,
              int: 10,
              str: 5,
              exp: 423,
              toNextLevel: 40,
              maxHealth: 50,
              maxMP: 103,
            },
          },
          task: {
            text: 'text',
          },
          direction: 'up',
          delta: 176,
        },
      });
    });

    it('sends task and stats data to globalActivity webhookd', () => {
      user.webhooks = [{
        id: 'globalActivity',
        url: 'http://global-activity.com',
        enabled: true,
        type: 'globalActivity',
      }];

      taskScoredWebhook.send(user, data);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://global-activity.com', {
        json: true,
        body: {
          type: 'scored',
          webhookType: 'taskActivity',
          user: {
            _id: user._id,
            _tmp: {foo: 'bar'},
            stats: {
              lvl: 5,
              int: 10,
              str: 5,
              exp: 423,
              toNextLevel: 40,
              maxHealth: 50,
              maxMP: 103,
            },
          },
          task: {
            text: 'text',
          },
          direction: 'up',
          delta: 176,
        },
      });
    });

    it('does not send task scored data if scored option is not true', () => {
      webhooks[0].options.scored = false;

      taskScoredWebhook.send(user, data);

      expect(got.post).to.not.be.called;
    });
  });

  describe('taskActivityWebhook', () => {
    let data;

    beforeEach(() => {
      data = {
        task: {
          text: 'text',
        },
      };
    });

    ['created', 'updated', 'deleted'].forEach((type) => {
      it(`sends ${type} tasks`, () => {
        data.type = type;

        taskActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[0].url, {
          json: true,
          body: {
            type,
            webhookType: 'taskActivity',
            user: {
              _id: user._id,
            },
            task: data.task,
          },
        });
      });

      it(`does not send task ${type} data if ${type} option is not true`, () => {
        data.type = type;
        webhooks[0].options[type] = false;

        taskActivityWebhook.send(user, data);

        expect(got.post).to.not.be.called;
      });
    });

    describe('checklistScored', () => {
      beforeEach(() => {
        data = {
          task: {
            text: 'text',
          },
          item: {
            text: 'item-text',
          },
        };
      });

      it('sends \'checklistScored\' tasks', () => {
        data.type = 'checklistScored';

        taskActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[0].url, {
          json: true,
          body: {
            webhookType: 'taskActivity',
            user: {
              _id: user._id,
            },
            type: data.type,
            task: data.task,
            item: data.item,
          },
        });
      });

      it('does not send task \'checklistScored\' data if \'checklistScored\' option is not true', () => {
        data.type = 'checklistScored';
        webhooks[0].options.checklistScored = false;

        taskActivityWebhook.send(user, data);

        expect(got.post).to.not.be.called;
      });
    });
  });

  describe('userActivityWebhook', () => {
    let data;

    beforeEach(() => {
      data = {
        something: true,
      };
    });

    ['petHatched', 'mountRaised', 'leveledUp'].forEach((type) => {
      it(`sends ${type} webhooks`, () => {
        data.type = type;

        userActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[2].url, {
          json: true,
          body: {
            type,
            webhookType: 'userActivity',
            user: {
              _id: user._id,
            },
            something: true,
          },
        });
      });

      it(`does not send webhook ${type} data if ${type} option is not true`, () => {
        data.type = type;
        webhooks[2].options[type] = false;

        userActivityWebhook.send(user, data);

        expect(got.post).to.not.be.called;
      });
    });
  });

  describe('questActivityWebhook', () => {
    let data;

    beforeEach(() => {
      data = {
        group: {
          id: 'group-id',
          name: 'some group',
          otherData: 'foo',
        },
        quest: {
          key: 'some-key',
        },
      };
    });

    ['questStarted', 'questFinised'].forEach((type) => {
      it(`sends ${type} webhooks`, () => {
        data.type = type;

        questActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[1].url, {
          json: true,
          body: {
            type,
            webhookType: 'questActivity',
            user: {
              _id: user._id,
            },
            group: {
              id: 'group-id',
              name: 'some group',
            },
            quest: {
              key: 'some-key',
            },
          },
        });
      });

      it(`does not send webhook ${type} data if ${type} option is not true`, () => {
        data.type = type;
        webhooks[1].options[type] = false;

        userActivityWebhook.send(user, data);

        expect(got.post).to.not.be.called;
      });
    });
  });

  describe('groupChatReceivedWebhook', () => {
    it('sends chat data', () => {
      let data = {
        group: {
          id: 'group-id',
          name: 'some group',
          otherData: 'foo',
        },
        chat: {
          id: 'some-id',
          text: 'message',
        },
      };

      groupChatReceivedWebhook.send(user, data);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch(webhooks[webhooks.length - 1].url, {
        json: true,
        body: {
          webhookType: 'groupChatReceived',
          user: {
            _id: user._id,
          },
          group: {
            id: 'group-id',
            name: 'some group',
          },
          chat: {
            id: 'some-id',
            text: 'message',
          },
        },
      });
    });

    it('does not send chat data for group if not selected', () => {
      let data = {
        group: {
          id: 'not-group-id',
          name: 'some group',
          otherData: 'foo',
        },
        chat: {
          id: 'some-id',
          text: 'message',
        },
      };

      groupChatReceivedWebhook.send(user, data);

      expect(got.post).to.not.be.called;
    });
  });
});
