import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

let user;
let endpoint = '/user/webhook';

describe('POST /user/webhook', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('validates', async () => {
    await expect(user.post(endpoint, { enabled: true })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidUrl'),
    });
  });

  it('successfully adds the webhook', async () => {
    expect(user.preferences.webhooks).to.eql({});
    let response = await user.post(endpoint, { enabled: true, url: 'http://some-url.com'});
    expect(response.id).to.exist;
    await user.sync();
    expect(user.preferences.webhooks).to.not.eql({});
  });
});
