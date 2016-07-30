import request from 'request';
import { each } from 'lodash';
import common from '../../../../../common';
import {
  WebhookSender,
  taskScoredWebhook,
  groupChatReceivedWebhook,
  taskCreatedWebhook,
} from '../../../../../website/server/libs/api-v3/webhook';

describe('webhooks', () => {
  let webhooks;

  beforeEach(() => {
    sandbox.stub(request, 'post');

    webhooks = {
      taskScored: { url: 'http://task-scored.com', enabled: true, type: 'taskScored' },
      taskCreated: { url: 'http://task-created.com', enabled: true, type: 'taskCreated' },
      groupChatReceived: {
        url: 'http://group-chat-received.com',
        enabled: true,
        type: 'groupChatReceived',
        options: {
          allGroups: false,
          groupIds: {
            'group-id': true,
            'not-this-group-id': false,
          },
        }
      },
    };
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

      sendWebhook.send({'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'}}, body);

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
        }
      });

      let body = { foo: 'bar' };

      sendWebhook.send({'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'}}, body);

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

      sendWebhook.send({'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'}}, body);

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

      sendWebhook.send({'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'}}, body);

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

      sendWebhook.send({
        'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom', options: { foo: 'bar' }},
        'other-custom-webhook': { url: 'http://other-custom-url.com', enabled: true, type: 'custom', options: { foo: 'foo' }},
      }, body);

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

      sendWebhook.send({'custom-webhook': { url: 'http://custom-url.com', enabled: false, type: 'custom'}}, body);

      expect(request.post).to.not.be.called;
    });

    it('ignores webhooks with invalid urls', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send({'custom-webhook': { url: 'httxp://custom-url!!', enabled: true, type: 'custom'}}, body);

      expect(request.post).to.not.be.called;
    });

    it('ignores webhooks of other types', () => {
      let sendWebhook = new WebhookSender({
        type: 'custom',
      });

      let body = { foo: 'bar' };

      sendWebhook.send({
        'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'},
        'other-webhook': { url: 'http://other-url.com', enabled: true, type: 'other'},
      }, body);

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

      sendWebhook.send({
        'custom-webhook': { url: 'http://custom-url.com', enabled: true, type: 'custom'},
        'other-custom-webhook': { url: 'http://other-url.com', enabled: true, type: 'custom'},
      }, body);

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
    it('sends task and stats data', () => {
      sandbox.stub(common, 'statsComputed').returns({
        maxMP: 103,
      });
      sandbox.stub(common, 'tnl').returns(40);
      let data = {
        user: {
          _id: 'user-id',
          _tmp: {foo: 'bar'},
          stats: {lvl: 5, int: 10, str: 5, exp: 423}
        },
        task: {
          text: 'text',
        },
        direction: 'up',
        delta: 176,
      };

      taskScoredWebhook.send(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
          user: {
            _id: 'user-id',
            _tmp: {foo: 'bar'},
            stats: {
              lvl: 5,
              int: 10,
              str: 5,
              exp: 423,
              toNextLevel: 40,
              maxHealth: common.maxHealth,
              maxMP: 103,
            }
          },
          task: {
            details: {text: 'text'},
            direction: 'up',
            delta: 176,
          },
        },
      });
    });
  });

  describe('taskCreatedWebhook', () => {
    it('sends newly created tasks', () => {
      let data = {
        tasks: [{
          text: 'text',
        }],
      };

      taskCreatedWebhook.send(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
          tasks: data.tasks,
        },
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
            name: 'some group'
          },
          chat: {
            id: 'some-id',
            text: 'message',
          }
        },
      });
    });

    it('sends chat for all groups if hook.options.allGroups is true', () => {
      webhooks.groupChatReceived.options.allGroups = true;

      let data = {
        group: {
          id: 'not-this-group-id',
          name: 'some group',
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
            id: 'not-this-group-id',
            name: 'some group'
          },
          chat: {
            id: 'some-id',
            text: 'message',
          }
        },
      });
    });

    it('sends chat for only specified groups if hook.options.allGroups is false', () => {
      webhooks.groupChatReceived.options.allGroups = false;

      let data = {
        group: {
          id: 'not-this-group-id',
          name: 'some group',
        },
        chat: {
          id: 'some-id',
          text: 'message',
        },
      };

      groupChatReceivedWebhook.send(webhooks, data);

      expect(request.post).to.not.be.called;

      data.group.id = 'group-id';
      groupChatReceivedWebhook.send(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWithMatch({
        body: {
          group: {
            id: 'group-id',
            name: 'some group'
          },
          chat: {
            id: 'some-id',
            text: 'message',
          }
        },
      });
    });
  });
});
