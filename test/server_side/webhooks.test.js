var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var rewire = require('rewire');

var webhook = rewire('../../website/src/libs/api-v2/webhook');

describe('webhooks', function() {
  var postSpy;

  beforeEach(function() {
    postSpy = sinon.stub();
    webhook.__set__('request.post', postSpy);
  });

  describe('sendTaskWebhook', function() {
    var task = {
      details: { _id: 'task-id' },
      delta: 1.4,
      direction: 'up'
    };

    var data = {
      task: task,
      user: { _id: 'user-id' }
    };

    it('does not send if no webhook endpoints exist', function() {
      var  webhooks = { };

      webhook.sendTaskWebhook(webhooks, data);

      expect(postSpy).to.not.be.called;
    });

    it('does not send if no webhooks are enabled', function() {
      var webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: false,
          url: 'http://example.org/endpoint'
        }
      };

      webhook.sendTaskWebhook(webhooks, data);

      expect(postSpy).to.not.be.called;
    });

    it('does not send if webhook url is not valid', function() {
      var webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://malformedurl/endpoint'
        }
      };

      webhook.sendTaskWebhook(webhooks, data);

      expect(postSpy).to.not.be.called;
    });

    it('sends task direction, task, task delta, and abridged user data', function() {
      var webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://example.org/endpoint'
        }
      };

      webhook.sendTaskWebhook(webhooks, data);

      expect(postSpy).to.be.calledOnce;
      expect(postSpy).to.be.calledWith({
        url: 'http://example.org/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id'
          }
        },
        json: true
      });
    });

    it('sends a post request for each webhook endpoint', function() {
      var webhooks = {
        'some-id': {
          sort: 0,
          id: 'some-id',
          enabled: true,
          url: 'http://example.org/endpoint'
        },
        'second-webhook': {
          sort: 1,
          id: 'second-webhook',
          enabled: true,
          url: 'http://example.com/2/endpoint'
        }
      };

      webhook.sendTaskWebhook(webhooks, data);

      expect(postSpy).to.be.calledTwice;
      expect(postSpy).to.be.calledWith({
        url: 'http://example.org/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id'
          }
        },
        json: true
      });
      expect(postSpy).to.be.calledWith({
        url: 'http://example.com/2/endpoint',
        body: {
          direction: 'up',
          task: { _id: 'task-id' },
          delta: 1.4,
          user: {
            _id: 'user-id'
          }
        },
        json: true
      });
    });
  });
});
