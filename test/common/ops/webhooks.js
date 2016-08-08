import {
  addWebhook,
  updateWebhook,
  deleteWebhook,
} from '../../../common/script/ops/webhooks';
import {
  BadRequest,
  NotFound,
} from '../../../common/script/libs/errors';
import {
  generateUser,
  translate as t,
} from '../../helpers/common.helper';
import {v4 as generateUUID} from 'uuid';

describe('webhooks', () => {
  let user;
  beforeEach(() => {
    user = generateUser();
  });

  describe('shared.ops.addWebhook', () => {
    let req;

    beforeEach(() => {
      req = {
        body: {
          id: generateUUID(),
          enabled: true,
          url: 'http://some-url.com',
        },
      };
    });

    it('requires req.body.url', (done) => {
      delete req.body.url;
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidUrl'));
        done();
      }
    });

    it('validates req.body.url', (done) => {
      req.body.url = 'not a url';
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidUrl'));
        done();
      }
    });

    it('validates req.body.id', (done) => {
      req.body.id = 'not-a-uuid';

      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidWebhookId'));
        done();
      }
    });

    it('supplies a default id if none is passed', () => {
      delete req.body.id;

      let result = addWebhook(user, req);

      expect(result[0].id).to.exist;
    });

    it('validates req.body.enabled', (done) => {
      req.body.enabled = 'not a boolean';
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidEnabled'));
        done();
      }
    });

    it('sets req.body.enabled to true by default if not passed in', () => {
      delete req.body.enabled;

      let result = addWebhook(user, req);

      expect(result[0].enabled).to.be.true;
    });

    it('can initiliaze enabled as false', () => {
      req.body.enabled = false;

      let result = addWebhook(user, req);

      expect(result[0].enabled).to.be.false;
    });

    it('defaults type to "taskActivity"', () => {
      let result = addWebhook(user, req);

      expect(result[0].type).to.eql('taskActivity');
    });

    it('can set type to acceptable webhook type', () => {
      req.body.type = 'groupChatReceived';
      req.body.options = {
        groupId: generateUUID(),
      };
      let result = addWebhook(user, req);

      expect(result[0].type).to.eql('groupChatReceived');
    });

    it('throws an error if incompatible type is passed', (done) => {
      req.body.type = 'not a webhook type';

      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceOf(BadRequest);
        expect(err.message).to.equal(t('invalidWebhookType', {type: 'not a webhook type'}));
        done();
      }
    });

    it('applies options if provided', () => {
      req.body.options = {
        groupId: generateUUID(),
      };
      req.body.type = 'groupChatReceived';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({
        groupId: req.body.options.groupId,
      });
    });

    it('returns an default object for taskActivity options', () => {
      req.body.type = 'taskActivity';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({
        created: false,
        updated: false,
        deleted: false,
        scored: true,
      });
    });

    it('throws an error if non-boolean values are provided for created parameter', () => {
      let errorCount = 0;

      req.body.type = 'taskActivity';
      req.body.options = {
        created: true,
        updated: true,
        deleted: true,
        scored: true,
      };

      Object.keys(req.body.options).forEach((key) => {
        req.body.options[key] = 'foo';

        try {
          addWebhook(user, req);
        } catch (err) {
          expect(err).to.be.an.instanceOf(BadRequest);
          expect(err.message).to.eql(t('webhookBooleanOption', { option: key}));
          req.body.options[key] = true;
          errorCount += 1;
        }
      });

      expect(errorCount).to.eql(4);
    });

    it('throws an error if supplied Id param for groupIds in groupChatRecieved is not a uuid', (done) => {
      req.body.type = 'groupChatReceived';
      req.body.options = {
        groupId: 'not a uuid',
      };

      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('groupIdRequired'));
        done();
      }
    });

    it('calls markModified()', () => {
      user.markModified = sinon.spy();
      addWebhook(user, req);
      expect(user.markModified.calledOnce).to.eql(true);
    });

    it('creates a new webhook', () => {
      expect(user.preferences.webhooks).to.eql({});
      addWebhook(user, req);
      expect(user.preferences.webhooks).to.not.eql({});
    });
  });

  describe('shared.ops.deleteWebhook', () => {
    let req;

    beforeEach(() => {
      user.preferences.webhooks = { 'some-id': {}, 'another-id': {} };
      req = { params: { id: 'some-id' } };
    });

    it('throws an error if webhooks with id does not exist', (done) => {
      req.params.id = 'fake-id';
      try {
        deleteWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(t('noWebhookWithId', {id: req.params.id}));
        done();
      }
    });

    it('deletes a webhook', () => {
      deleteWebhook(user, req);

      expect(user.preferences.webhooks).to.eql({'another-id': {}});
    });

    it('calls markModified()', () => {
      user.markModified = sinon.spy();
      deleteWebhook(user, req);
      expect(user.markModified.calledOnce).to.eql(true);
    });

    it('returns the remaining webhooks object', () => {
      let [data] = deleteWebhook(user, req);

      expect(data).to.equal(user.preferences.webhooks);
    });
  });

  describe('shared.ops.updateWebhook', () => {
    let req;

    beforeEach(() => {
      user.preferences.webhooks['this-id'] = {
        id: 'this-id',
        url: 'http://old-url.com',
        enabled: false,
        type: 'taskActivity',
        options: {
          created: true,
          updated: true,
          deleted: false,
          scored: false,
        },
      };
      req = {
        params: {
          id: 'this-id',
        },
        body: {
          url: 'http://new-url.com',
          type: 'taskActivity',
          enabled: true,
        },
      };
    });

    it('throws an error if webhook id does not exist', (done) => {
      req.params.id = 'not-a-real-id';

      try {
        updateWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(t('noWebhookWithId', {id: req.params.id}));
        done();
      }
    });

    it('throws an error if updated url is not a valid url', (done) => {
      req.body.url = 'htt\\\\\\\badurl.com';

      try {
        updateWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidUrl'));
        done();
      }
    });

    it('throws an error if updated enable property is not a boolean', (done) => {
      req.body.enabled = 'a string';

      try {
        updateWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidEnabled'));
        done();
      }
    });

    it('throws an error if type is not a valid type', (done) => {
      req.body.type = 'not a valid type';

      try {
        updateWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidWebhookType', {type: 'not a valid type'}));
        done();
      }
    });

    it('throws an error if groupId option for groupChatReceived is not a uuid', (done) => {
      req.body.type = 'groupChatReceived';
      req.body.options = {
        groupIds: {
          'not a uuid': true,
        },
      };

      try {
        updateWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('groupIdRequired'));
        done();
      }
    });

    it('can set enabled to false', () => {
      let webhook = user.preferences.webhooks['this-id'];
      webhook.enabled = true;
      req.body.enabled = false;

      updateWebhook(user, req);

      expect(webhook.enabled).to.be.false;
    });

    it('applies options if provided', () => {
      req.body.options = {
        groupId: generateUUID(),
      };
      req.body.type = 'groupChatReceived';

      let result = updateWebhook(user, req);

      expect(result[0].options).to.eql({
        groupId: req.body.options.groupId,
      });
    });

    it('sanitizes options', () => {
      req.body.options = {
        foo: 'bar',
        created: true,
        scored: false,
      };
      req.body.type = 'taskActivity';

      let result = updateWebhook(user, req);

      expect(result[0].options).to.eql({
        created: true,
        deleted: false,
        scored: false,
        updated: false,
      });
    });

    it('calls markModified()', () => {
      user.markModified = sinon.spy();
      updateWebhook(user, req);
      expect(user.markModified.calledOnce).to.eql(true);
    });

    it('updates webhook', () => {
      updateWebhook(user, req);

      let webhook = user.preferences.webhooks['this-id'];

      expect(webhook.url).to.eql('http://new-url.com');
      expect(webhook.enabled).to.eql(true);
      expect(webhook.type).to.eql('taskActivity');
    });
  });
});
