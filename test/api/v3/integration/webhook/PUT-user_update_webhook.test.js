import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('PUT /user/webhook/:id', () => {
  let user, webhookToUpdate;

  beforeEach(async () => {
    user = await generateUser();

    webhookToUpdate = await user.post('/user/webhook', {
      url: 'http://some-url.com',
      enabled: true,
    });
    await user.post('/user/webhook', {
      url: 'http://some-other-url.com',
      enabled: false,
    });

    await user.sync();
  });

  it('returns an error if webhook with id does not exist', async () => {
    await expect(user.put('/user/webhook/id-that-does-not-exist')).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('noWebhookWithId', {id: 'id-that-does-not-exist'}),
    });
  });

  it('returns an error if validation fails', async () => {
    await expect(user.put(`/user/webhook/${webhookToUpdate.id}`, { url: 'foo', enabled: true })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidUrl'),
    });
  });

  it('updates a webhook', async () => {
    let url = 'http://a-new-url.com';
    let type = 'taskActivity';

    await user.put(`/user/webhook/${webhookToUpdate.id}`, {url, type});

    await user.sync();

    expect(user.preferences.webhooks[webhookToUpdate.id].url).to.eql(url);
    expect(user.preferences.webhooks[webhookToUpdate.id].type).to.eql(type);
  });

  it('returns the updated webhook', async () => {
    let type = 'taskActivity';
    let url = 'http://a-new-url.com';
    let response = await user.put(`/user/webhook/${webhookToUpdate.id}`, {url, type});

    expect(response.url).to.eql(url);
    expect(response.type).to.eql(type);
  });
});
