import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID} from 'uuid';

describe('PUT /user/webhook/:id', () => {
  let user, webhookToUpdate;

  beforeEach(async () => {
    user = await generateUser();

    webhookToUpdate = await user.post('/user/webhook', {
      url: 'http://some-url.com',
      label: 'Original Label',
      enabled: true,
      type: 'taskActivity',
      options: { created: true, scored: true },
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
      message: 'User validation failed',
    });
  });

  it('updates a webhook', async () => {
    let url = 'http://a-new-url.com';
    let type = 'groupChatReceived';
    let label = 'New Label';
    let options = { groupId: generateUUID() };

    await user.put(`/user/webhook/${webhookToUpdate.id}`, {url, type, options, label});

    await user.sync();

    let webhook = user.webhooks.find(hook => webhookToUpdate.id === hook.id);

    expect(webhook.url).to.equal(url);
    expect(webhook.label).to.equal(label);
    expect(webhook.type).to.equal(type);
    expect(webhook.options).to.eql(options);
  });

  it('returns the updated webhook', async () => {
    let url = 'http://a-new-url.com';
    let type = 'groupChatReceived';
    let options = { groupId: generateUUID() };

    let response = await user.put(`/user/webhook/${webhookToUpdate.id}`, {url, type, options});

    expect(response.url).to.eql(url);
    expect(response.type).to.eql(type);
    expect(response.options).to.eql(options);
  });

  it('cannot update the id', async () => {
    let id = generateUUID();
    let url = 'http://a-new-url.com';

    await user.put(`/user/webhook/${webhookToUpdate.id}`, {url, id});

    await user.sync();

    let webhook = user.webhooks.find(hook => webhookToUpdate.id === hook.id);

    expect(webhook.id).to.eql(webhookToUpdate.id);
    expect(webhook.url).to.eql(url);
  });

  it('can update taskActivity options', async () => {
    let type = 'taskActivity';
    let options = {
      updated: false,
      deleted: true,
    };

    let webhook = await user.put(`/user/webhook/${webhookToUpdate.id}`, {type, options});

    expect(webhook.options).to.eql({
      created: true, // starting value
      updated: false,
      deleted: true,
      scored: true, // default value
    });
  });

  it('errors if taskActivity option is not a boolean', async () => {
    let type = 'taskActivity';
    let options = {
      created: 'not a boolean',
      updated: false,
      deleted: true,
    };

    await expect(user.put(`/user/webhook/${webhookToUpdate.id}`, {type, options})).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('webhookBooleanOption', { option: 'created' }),
    });
  });

  it('errors if groupChatRecieved groupId option is not a uuid', async () => {
    let type = 'groupChatReceived';
    let options = {
      groupId: 'not-a-uuid',
    };

    await expect(user.put(`/user/webhook/${webhookToUpdate.id}`, {type, options})).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('groupIdRequired'),
    });
  });
});
