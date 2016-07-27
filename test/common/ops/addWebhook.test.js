import addWebhook from '../../../common/script/ops/addWebhook';
import {
  BadRequest,
} from '../../../common/script/libs/errors';
import {
  generateUser,
  translate as t,
} from '../../helpers/common.helper';
import {v4 as generateUUID} from 'uuid';

describe('shared.ops.addWebhook', () => {
  let user;
  let req;

  beforeEach(() => {
    user = generateUser();
    req = {
      body: {
        enabled: true,
        url: 'http://some-url.com',
      },
    };
  });

  context('adds webhook', () => {
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

    it('succeeds', () => {
      expect(user.preferences.webhooks).to.eql({});
      addWebhook(user, req);
      expect(user.preferences.webhooks).to.not.eql({});
    });
  });
});
