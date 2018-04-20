import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /user/webhook', () => {
  let user, body;

  beforeEach(async () => {
    user = await generateUser();
    body = {
      id: generateUUID(),
      url: 'https://example.com/endpoint',
      type: 'taskActivity',
      enabled: false,
    };
  });

  it('requires a url', async () => {
    delete body.url;

    await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'User validation failed',
    });
  });

  it('requires custom id to be a uuid', async () => {
    body.id = 'not-a-uuid';

    await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'User validation failed',
    });
  });

  it('defaults id to a uuid', async () => {
    delete body.id;

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.id).to.exist;
  });

  it('requires type to be of an accetable type', async () => {
    body.type = 'not a valid type';

    await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'User validation failed',
    });
  });

  it('defaults enabled to true', async () => {
    delete body.enabled;

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.enabled).to.be.true;
  });

  it('can pass a label', async () => {
    body.label = 'Custom Label';

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.label).to.equal('Custom Label');
  });

  it('defaults type to taskActivity', async () => {
    delete body.type;

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.type).to.eql('taskActivity');
  });

  it('successfully adds the webhook', async () => {
    expect(user.webhooks).to.eql([]);

    let response = await user.post('/user/webhook', body);

    expect(response.id).to.eql(body.id);
    expect(response.type).to.eql(body.type);
    expect(response.url).to.eql(body.url);
    expect(response.enabled).to.eql(body.enabled);

    await user.sync();

    expect(user.webhooks).to.not.eql([]);

    let webhook = user.webhooks[0];

    expect(webhook.enabled).to.be.false;
    expect(webhook.type).to.eql('taskActivity');
    expect(webhook.url).to.eql(body.url);
  });

  it('cannot use an id of a webhook that already exists', async () => {
    await user.post('/user/webhook', body);

    await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('webhookIdAlreadyTaken', { id: body.id }),
    });
  });

  it('defaults taskActivity options', async () => {
    body.type = 'taskActivity';

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      created: false,
      updated: false,
      deleted: false,
      scored: true,
    });
  });

  it('can set taskActivity options', async () => {
    body.type = 'taskActivity';
    body.options = {
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    };

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    });
  });

  it('discards extra properties in taskActivity options', async () => {
    body.type = 'taskActivity';
    body.options = {
      created: true,
      updated: true,
      deleted: true,
      scored: false,
      foo: 'bar',
    };

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    });
  });

  ['created', 'updated', 'deleted', 'scored'].forEach((option) => {
    it(`requires taskActivity option ${option} to be a boolean`, async () => {
      body.type = 'taskActivity';
      body.options = {
        [option]: 'not a boolean',
      };

      await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('webhookBooleanOption', { option }),
      });
    });
  });

  it('can set groupChatReceived options', async () => {
    body.type = 'groupChatReceived';
    body.options = {
      groupId: generateUUID(),
    };

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      groupId: body.options.groupId,
    });
  });

  it('groupChatReceived options requires a uuid for the groupId', async () => {
    body.type = 'groupChatReceived';
    body.options = {
      groupId: 'not-a-uuid',
    };

    await expect(user.post('/user/webhook', body)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('groupIdRequired'),
    });
  });

  it('discards extra properties in groupChatReceived options', async () => {
    body.type = 'groupChatReceived';
    body.options = {
      groupId: generateUUID(),
      foo: 'bar',
    };

    let webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({
      groupId: body.options.groupId,
    });
  });
});
