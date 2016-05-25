import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

let user;
let url = 'http://new-url.com';
let enabled = true;

describe('PUT /user/webhook/:id', () => {
  beforeEach(async () => {
    user = await generateUser();
  });

  it('validation fails', async () => {
    await expect(user.put('/user/webhook/some-id'), { enabled: true }).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidUrl'),
    });
  });

  it('succeeds', async () => {
    let response = await user.post('/user/webhook', { enabled: true, url: 'http://some-url.com'});
    await user.sync();
    expect(user.preferences.webhooks[response.id].url).to.not.eql(url);
    let response2 = await user.put(`/user/webhook/${response.id}`, {url, enabled});
    expect(response2.url).to.eql(url);
    await user.sync();
    expect(user.preferences.webhooks[response.id].url).to.eql(url);
  });
});
