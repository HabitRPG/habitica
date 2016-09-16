import addWebhook from '../../../website/common/script/ops/addWebhook';
import {
  BadRequest,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.addWebhook', () => {
  let user;
  let req;

  beforeEach(() => {
    user = generateUser();
    req = { body: {
      enabled: true,
      url: 'http://some-url.com',
    } };
  });

  context('adds webhook', () => {
    it('validates req.body.url', (done) => {
      delete req.body.url;
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidUrl'));
        done();
      }
    });

    it('validates req.body.enabled', (done) => {
      delete req.body.enabled;
      try {
        addWebhook(user, req);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidEnabled'));
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
