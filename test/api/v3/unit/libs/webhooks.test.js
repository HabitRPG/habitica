import request from 'request';
import { sendTaskWebhook } from '../../../../../website/server/libs/webhook';

describe('webhooks', () => {
  beforeEach(() => {
    sandbox.stub(request, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendTaskWebhook', () => {
    let task = {
      details: { _id: 'task-id' },
      delta: 1.4,
      direction: 'up',
    };

    let data = {
      task,
      user: { _id: 'user-id' },
    };

    it('does not send if no webhook endpoints exist', () => {
      let  webhooks = { };

      sendTaskWebhook(webhooks, data);

      expect(request.post).to.not.be.called;
    });

    it('does not send if no webhooks are enabled', () => {
      let webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: false,
          url: 'http://example.org/endpoint',
        },
      };

      sendTaskWebhook(webhooks, data);

      expect(request.post).to.not.be.called;
    });

    it('does not send if webhook url is not valid', () => {
      let webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://malformedurl/endpoint',
        },
      };

      sendTaskWebhook(webhooks, data);

      expect(request.post).to.not.be.called;
    });

    it('sends task direction, task, task delta, and abridged user data', () => {
      let webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://example.org/endpoint',
        },
      };

      sendTaskWebhook(webhooks, data);

      expect(request.post).to.be.calledOnce;
      expect(request.post).to.be.calledWith({
        url: 'http://example.org/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id',
          },
        },
        json: true,
      });
    });

    it('sends a post request for each webhook endpoint', () => {
      let webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://example.org/endpoint',
        },
        'second-webhook': {
          sort: 1,
          id: 'second-webhook',
          enabled: true,
          url: 'http://example.com/2/endpoint',
        },
      };

      sendTaskWebhook(webhooks, data);

      expect(request.post).to.be.calledTwice;
      expect(request.post).to.be.calledWith({
        url: 'http://example.org/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id',
          },
        },
        json: true,
      });
      expect(request.post).to.be.calledWith({
        url: 'http://example.com/2/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id',
          },
        },
        json: true,
      });
    });
  });
});
