import updateWebhook from '../../../website/common/script/ops/updateWebhook';
import {
  BadRequest,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.updateWebhook', () => {
  let user;
  let req;
  let newUrl = 'http://new-url.com';

  beforeEach(() => {
    user = generateUser();
    req = { params: {
      id: 'this-id',
    }, body: {
      url: newUrl,
      enabled: true,
    } };
  });

  it('validates body', (done) => {
    delete req.body.url;
    try {
      updateWebhook(user, req);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUrl'));
      done();
    }
  });

  it('succeeds', () => {
    let url = 'http://existing-url.com';
    user.preferences.webhooks = { 'this-id': { url } };
    updateWebhook(user, req);
    expect(user.preferences.webhooks['this-id'].url).to.eql(newUrl);
  });
});
