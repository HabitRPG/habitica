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

    let webhookId = Object.keys(user.preferences.webhooks)[0];
    let webhook = user.preferences.webhooks[webhookId];

    expect(webhook.enabled).to.be.true;
    expect(webhook.type).to.eql('taskScored'); // default value
    expect(webhook.url).to.eql('http://some-url.com');
  });

  it('successfully adds a webhook of a specific type', async () => {
    expect(user.preferences.webhooks).to.eql({});

    let response = await user.post(endpoint, {
      enabled: true,
      url: 'http://some-url.com',
      type: 'questActivity',
      options: {
        onStart: true,
      },
    });

    expect(response.id).to.exist;

    console.log(response);

    await user.sync();

    let webhookId = Object.keys(user.preferences.webhooks)[0];
    let webhook = user.preferences.webhooks[webhookId];

    expect(webhook.type).to.eql('questActivity');
    expect(webhook.options).to.eql({
      onStart: true,
      onComplete: false,
      onInvitation: false,
    });
  });
});
