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
          enabled: true,
          url: 'http://some-url.com',
        },
      };
    });

    it('validates req.body.url', (done) => {
      delete req.body.url;
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidUrl'));
        done();
      }
    });

    it('validates req.body.enabled', (done) => {
      delete req.body.enabled;
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('invalidEnabled'));
        done();
      }
    });

    it('defaults type to "taskScored"', () => {
      let result = addWebhook(user, req);

      expect(result[0].type).to.eql('taskScored');
    });

    it('can set type to acceptable webhook type', () => {
      req.body.type = 'questActivity';
      let result = addWebhook(user, req);

      expect(result[0].type).to.eql('questActivity');
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
      req.body.options = {groupId: generateUUID()};
      req.body.type = 'groupChatReceived';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql(req.body.options);
    });

    it('sanitizes options', () => {
      req.body.options = {
        foo: 'bar',
        onStart: { dummy: 'value' },
        onComplete: true,
        onInvitation: false,
      };
      req.body.type = 'questActivity';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({
        onStart: false,
        onComplete: true,
        onInvitation: false,
      });
    });

    it('returns an empty object for taskScored options', () => {
      req.body.type = 'taskScored';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({});
    });

    it('returns an empty object for taskCreated options', () => {
      req.body.type = 'taskCreated';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({});
    });

    it('returns an object with default settings for questActivity options', () => {
      req.body.type = 'questActivity';

      let result = addWebhook(user, req);

      expect(result[0].options).to.eql({
        onStart: false,
        onComplete: false,
        onInvitation: false,
      });
    });

    it('throws an error if supplied groupId param for groupChatRecieved is not a uuid', (done) => {
      req.body.type = 'groupChatReceived';
      req.body.options = {groupId: 'not a uuid'};

      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(t('groupIdRequired'));
        done();
      }
    });

    it('calls marksModified()', () => {
      user.markModified = sinon.spy();
      addWebhook(user, req);
      expect(user.markModified.called).to.eql(true);
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
        type: 'taskCreated',
        options: {},
      };
      req = {
        params: {
          id: 'this-id',
        },
        body: {
          url: 'http://new-url.com',
          type: 'questActivity',
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
        groupId: 'not a uuid',
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
      req.body.options = {groupId: generateUUID()};
      req.body.type = 'groupChatReceived';

      let result = updateWebhook(user, req);

      expect(result[0].options).to.eql(req.body.options);
    });

    it('sanitizes options', () => {
      req.body.options = {
        foo: 'bar',
        onStart: { dummy: 'value' },
        onComplete: true,
        onInvitation: false,
      };
      req.body.type = 'questActivity';

      let result = updateWebhook(user, req);

      expect(result[0].options).to.eql({
        onStart: false,
        onComplete: true,
        onInvitation: false,
      });
    });

    it('updates webhook', () => {
      updateWebhook(user, req);

      let webhook = user.preferences.webhooks['this-id'];

      expect(webhook.url).to.eql('http://new-url.com');
      expect(webhook.enabled).to.eql(true);
      expect(webhook.type).to.eql('questActivity');
    });
  });
});
