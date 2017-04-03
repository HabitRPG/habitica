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
    expect(user.webhooks).to.have.a.lengthOf(2);
    await user.del(`${endpoint}/${webhookToDelete.id}`);

    await user.sync();

    expect(user.webhooks).to.have.a.lengthOf(1);
  });

  it('returns the remaining webhooks', async () => {
    let [remainingWebhook] = await user.del(`${endpoint}/${webhookToDelete.id}`);

    await user.sync();

    let webhook = user.webhooks[0];

    expect(remainingWebhook.id).to.eql(webhook.id);
    expect(remainingWebhook.url).to.eql(webhook.url);
    expect(remainingWebhook.type).to.eql(webhook.type);
    expect(remainingWebhook.options).to.eql(webhook.options);
  });

  it('returns an error if webhook with id does not exist', async () => {
    await expect(user.del(`${endpoint}/id-that-does-not-exist`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('noWebhookWithId', {id: 'id-that-does-not-exist'}),
    });
  });
});
