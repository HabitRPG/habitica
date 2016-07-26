import addWebhook from '../../../common/script/ops/addWebhook';
import {
  BadRequest,
} from '../../../common/script/libs/errors';
import {
  generateUser,
  translate as t,
} from '../../helpers/common.helper';

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

    it('defaults kind to "taskScored"', () => {
      let result = addWebhook(user, req);

      expect(result[0].kind).to.eql('taskScored');
    });

    it('can set kind to acceptable webhook kind', () => {
      req.body.kind = 'questActivity';
      let result = addWebhook(user, req);

      expect(result[0].kind).to.eql('questActivity');
    });

    it('throws an error if incompatible kind is passed', (done) => {
      req.body.kind = 'not a webhook kind';

      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceOf(BadRequest);
        expect(err.message).to.equal(t('invalidWebhookKind', {kind: 'not a webhook kind'}));
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
