import request from 'request';
import {
  WebhookSender,
  taskScoredWebhook,
  groupChatReceivedWebhook,
  taskActivityWebhook,
} from '../../../../../website/server/libs/webhook';

describe('webhooks', () => {
  let webhooks;

  beforeEach(() => {
    sandbox.stub(request, 'post');

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

      sendWebhook.send([{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}], body);

      expect(WebhookSender.defaultTransformData).to.be.calledOnce;
      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body,
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

      sendWebhook.send([{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}], body);

      expect(WebhookSender.defaultTransformData).to.not.be.called;
      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
          foo: 'bar',
          baz: 'biz',
        },
      });
    });

    it('provieds a default filter function', () => {
      sandbox.spy(WebhookSender, 'defaultWebhookFilter');
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send([{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}], body);

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

      sendWebhook.send([{id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'}], body);

      expect(WebhookSender.defaultWebhookFilter).to.not.be.called;
      expect(request.post).to.not.be.called;
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

      sendWebhook.send([
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom', options: { foo: 'bar' }},
        { id: 'other-custom-webhook', url: 'http://other-custom-url.com', enabled: true, type: 'custom', options: { foo: 'foo' }},
      ], body);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        url: 'http://custom-url.com',
      });
    });

    it('ignores disabled webhooks', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send([{id: 'custom-webhook', url: 'http://custom-url.com', enabled: false, type: 'custom'}], body);

      expect(request.post).to.not.be.called;
    });

    it('ignores webhooks with invalid urls', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send([{id: 'custom-webhook', url: 'httxp://custom-url!!', enabled: true, type: 'custom'}], body);

      expect(request.post).to.not.be.called;
    });

    it('ignores webhooks of other types', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send([
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'},
        { id: 'other-webhook', url: 'http://other-url.com', enabled: true, type: 'other'},
      ], body);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        url: 'http://custom-url.com',
        body,
        json: true,
      });
    });

    it('sends multiple webhooks of the same type', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send([
        { id: 'custom-webhook', url: 'http://custom-url.com', enabled: true, type: 'custom'},
        { id: 'other-custom-webhook', url: 'http://other-url.com', enabled: true, type: 'custom'},
      ], body);

      expect(request.post).to.be.calledTwice;
      expect(request.post).to.be.calledWithMatch({
        url: 'http://custom-url.com',
        body,
        json: true,
      });
      expect(request.post).to.be.calledWithMatch({
        url: 'http://other-url.com',
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
          _id: 'user-id',
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
          addComputedStatsToJSONObj () {
            let mockStats = Object.assign({
              maxHealth: 50,
              maxMP: 103,
              toNextLevel: 40,
            }, this.stats);

            delete mockStats.toJSON;

            return mockStats;
          },
        },
        task: {
          text: 'text',
        },
        direction: 'up',
        delta: 176,
      };
    });

    it('sends task and stats data', () => {
      taskScoredWebhook.send(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
          type: 'scored',
          user: {
            _id: 'user-id',
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

      taskScoredWebhook.send(webhooks, data);

      expect(request.post).to.not.be.called;
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

        taskActivityWebhook.send(webhooks, data);

        expect(request.post).to.be.calledOnce;
        expect(request.post).to.be.calledWithMatch({
          body: {
            type,
            task: data.task,
          },
        });
      });

      it(`does not send task ${type} data if ${type} option is not true`, () => {
        data.type = type;
        webhooks[0].options[type] = false;

        taskActivityWebhook.send(webhooks, data);

        expect(request.post).to.not.be.called;
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

      groupChatReceivedWebhook.send(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
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

      groupChatReceivedWebhook.send(webhooks, data);

      expect(request.post).to.not.be.called;
    });
  });
});
