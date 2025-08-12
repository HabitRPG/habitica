import got from 'got';
import moment from 'moment';
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
  defer,
  sleep,
} from '../../../helpers/api-unit.helper';
import logger from '../../../../website/server/libs/logger';

describe('webhooks', () => {
  let webhooks; let
    user;

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
        questInvited: true,
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
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      expect(sendWebhook.type).to.equal('custom');
      expect(sendWebhook).to.respondTo('send');
    });

    it('provides default function for data transformation', () => {
      sandbox.spy(WebhookSender, 'defaultTransformData');
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultTransformData).to.be.calledOnce;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: body,
      });
    });

    it('adds default data (user and webhookType) to the body', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });
      sandbox.spy(sendWebhook, 'attachDefaultData');

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(sendWebhook.attachDefaultData).to.be.calledOnce;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: body,
      });

      expect(body).to.eql({
        foo: 'bar',
        user: { _id: user._id },
        webhookType: 'custom',
      });
    });

    it('can pass in a data transformation function', () => {
      sandbox.spy(WebhookSender, 'defaultTransformData');
      const sendWebhook = new WebhookSender({
        type: 'custom',
        transformData (data) {
          const dataToSend = { baz: 'biz', ...data };

          return dataToSend;
        },
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultTransformData).to.not.be.called;
      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: {
          foo: 'bar',
          baz: 'biz',
        },
      });
    });

    it('provides a default filter function', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultWebhookFilter).to.be.calledOnce;
    });

    it('can pass in a webhook filter function', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      const sendWebhook = new WebhookSender({
        type: 'custom',
        webhookFilter (hook) {
          return hook.url !== 'http://custom-url.com';
        },
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(WebhookSender.defaultWebhookFilter).to.not.be.called;
      expect(got.post).to.not.be.called;
    });

    it('can pass in a webhook filter function that filters on data', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      const sendWebhook = new WebhookSender({
        type: 'custom',
        webhookFilter (hook, data) {
          return hook.options.foo === data.foo;
        },
      });

      const body = { foo: 'bar' };

      user.webhooks = [
        {
          id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom', options: { foo: 'bar' },
        },
        {
          id: 'other-custom-webhook', url: 'http://other-custom-url.com', enabled: true, type: 'custom', options: { foo: 'foo' },
        },
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com');
    });

    it('ignores disabled webhooks', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'http://custom-url.com', enabled: false, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(got.post).to.not.be.called;
    });

    it('ignores webhooks with invalid urls', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [{
        id: 'custom-webhook', url: 'httxp://custom-url!!!', enabled: true, type: 'custom',
      }];
      sendWebhook.send(user, body);

      expect(got.post).to.not.be.called;
    });

    it('ignores webhooks of other types', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [
        {
          id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
        },
        {
          id: 'other-webhook', url: 'http://other-url.com', enabled: true, type: 'other',
        },
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: body,
      });
    });

    it('sends every type of activity to global webhooks', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [
        {
          id: 'global-webhook', url: 'http://custom-url.com', enabled: true, type: 'globalActivity',
        },
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: body,
      });
    });

    it('sends multiple webhooks of the same type', () => {
      const sendWebhook = new WebhookSender({
        type: 'custom',
      });

      const body = { foo: 'bar' };

      user.webhooks = [
        {
          id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom',
        },
        {
          id: 'other-custom-webhook', url: 'http://other-url.com', enabled: true, type: 'custom',
        },
      ];
      sendWebhook.send(user, body);

      expect(got.post).to.be.calledTwice;
      expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
        json: body,
      });
      expect(got.post).to.be.calledWithMatch('http://other-url.com', {
        json: body,
      });
    });

    describe('failures', () => {
      let sendWebhook;

      beforeEach(async () => {
        sandbox.restore();
        sandbox.stub(got, 'post').returns(Promise.reject());

        sendWebhook = new WebhookSender({ type: 'taskActivity' });
        user.webhooks = [{
          url: 'http://custom-url.com', enabled: true, type: 'taskActivity',
        }];
        await user.save();

        expect(user.webhooks[0].failures).to.equal(0);
        expect(user.webhooks[0].lastFailureAt).to.equal(undefined);
      });

      it('does not increase failures counter if request is successfull', async () => {
        sandbox.restore();
        sandbox.stub(got, 'post').returns(Promise.resolve());

        const body = {};
        sendWebhook.send(user, body);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
          json: body,
        });

        await sleep(0.1);
        user = await User.findById(user._id).exec();

        expect(user.webhooks[0].failures).to.equal(0);
        expect(user.webhooks[0].lastFailureAt).to.equal(undefined);
      });

      it('records failures', async () => {
        sinon.stub(logger, 'error');
        const body = {};
        sendWebhook.send(user, body);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch('http://custom-url.com', {
          json: body,
        });

        await sleep(0.1);
        user = await User.findById(user._id).exec();

        expect(user.webhooks[0].failures).to.equal(1);
        expect((Date.now() - user.webhooks[0].lastFailureAt.getTime()) < 10000).to.be.true;

        expect(logger.error).to.be.calledOnce;
        logger.error.restore();
      });

      it('disables a webhook after 10 failures', async () => {
        const times = 10;
        for (let i = 0; i < times; i += 1) {
          sendWebhook.send(user, {});
          await sleep(0.1); // eslint-disable-line no-await-in-loop
          user = await User.findById(user._id).exec(); // eslint-disable-line no-await-in-loop
        }

        expect(got.post).to.be.callCount(10);
        expect(got.post).to.be.calledWithMatch('http://custom-url.com');

        await sleep(0.1);
        user = await User.findById(user._id).exec();

        expect(user.webhooks[0].enabled).to.equal(false);
        expect(user.webhooks[0].failures).to.equal(0);
      });

      it('resets failures after a month ', async () => {
        const oneMonthAgo = moment().subtract(1, 'months').subtract(1, 'days').toDate();
        user.webhooks[0].lastFailureAt = oneMonthAgo;
        user.webhooks[0].failures = 9;

        await user.save();

        sendWebhook.send(user, []);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch('http://custom-url.com');

        await sleep(0.1);
        user = await User.findById(user._id).exec();

        expect(user.webhooks[0].failures).to.equal(1);
        // Check that the stored date is whitin 10s from now
        expect((Date.now() - user.webhooks[0].lastFailureAt.getTime()) < 10000).to.be.true;
      });
    });
  });

  describe('taskScoredWebhook', () => {
    let data;

    beforeEach(() => {
      data = {
        user: {
          _tmp: { foo: 'bar' },
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

      const mockStats = {
        maxHealth: 50,
        maxMP: 103,
        toNextLevel: 40,
        ...data.user.stats,
      };
      delete mockStats.toJSON;

      sandbox.stub(User, 'addComputedStatsToJSONObj').returns(mockStats);
    });

    it('sends task and stats data', () => {
      taskScoredWebhook.send(user, data);

      expect(got.post).to.be.calledOnce;
      expect(got.post).to.be.calledWithMatch(webhooks[0].url, {
        json: {
          type: 'scored',
          webhookType: 'taskActivity',
          user: {
            _id: user._id,
            _tmp: { foo: 'bar' },
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
        json: {
          type: 'scored',
          webhookType: 'taskActivity',
          user: {
            _id: user._id,
            _tmp: { foo: 'bar' },
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

    ['created', 'updated', 'deleted'].forEach(type => {
      it(`sends ${type} tasks`, () => {
        data.type = type;

        taskActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[0].url, {
          json: {
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
          json: {
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

    ['petHatched', 'mountRaised', 'leveledUp'].forEach(type => {
      it(`sends ${type} webhooks`, () => {
        data.type = type;

        userActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[2].url, {
          json: {
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
          quest: {},
        },
        quest: {
          key: 'some-key',
          questOwner: 'user-id',
        },
      };
    });

    ['questStarted', 'questFinised', 'questInvited'].forEach(type => {
      it(`sends ${type} webhooks`, () => {
        data.type = type;

        questActivityWebhook.send(user, data);

        expect(got.post).to.be.calledOnce;
        expect(got.post).to.be.calledWithMatch(webhooks[1].url, {
          json: {
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
      const data = {
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
        json: {
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
      const data = {
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
