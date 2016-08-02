import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

let user, webhookToDelete;
let endpoint = '/user/webhook';

describe('DELETE /user/webhook', () => {
  beforeEach(async () => {
    user = await generateUser();

    webhookToDelete = await user.post('/user/webhook', {
      url: 'http://some-url.com',
      enabled: true,
    });
    await user.post('/user/webhook', {
      url: 'http://some-other-url.com',
      enabled: false,
    });

    await user.sync();
  });

  it('deletes a webhook', async () => {
    await user.del(`${endpoint}/${webhookToDelete.id}`);

    await user.sync();

    expect(user.preferences.webhooks[webhookToDelete.id]).to.not.exist;
  });

  it('returns the remaining webhooks', async () => {
    let response = await user.del(`${endpoint}/${webhookToDelete.id}`);

    await user.sync();

    expect(response).to.eql(user.preferences.webhooks);
  });

  it('returns an error if webhook with id does not exist', async () => {
    await expect(user.del(`${endpoint}/id-that-does-not-exist`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('noWebhookWithId', {id: 'id-that-does-not-exist'}),
    });
  });
});
