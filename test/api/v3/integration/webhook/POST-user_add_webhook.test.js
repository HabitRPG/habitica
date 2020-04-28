import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import apiError from '../../../../../website/server/libs/apiError';

describe('POST /user/webhook', () => {
  let user; let
    body;

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

    const webhook = await user.post('/user/webhook', body);

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

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.enabled).to.be.true;
  });

  it('can pass a label', async () => {
    body.label = 'Custom Label';

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.label).to.equal('Custom Label');
  });

  it('defaults type to taskActivity', async () => {
    delete body.type;

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.type).to.eql('taskActivity');
  });

  it('ignores protected fields', async () => {
    body.failures = 3;
    body.lastFailureAt = new Date();

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.failures).to.eql(0);
    expect(webhook.lastFailureAt).to.eql(undefined);
  });

  it('successfully adds the webhook', async () => {
    expect(user.webhooks).to.eql([]);

    const response = await user.post('/user/webhook', body);

    expect(response.id).to.eql(body.id);
    expect(response.type).to.eql(body.type);
    expect(response.url).to.eql(body.url);
    expect(response.enabled).to.eql(body.enabled);

    await user.sync();

    expect(user.webhooks).to.not.eql([]);

    const webhook = user.webhooks[0];

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

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      checklistScored: false,
      created: false,
      updated: false,
      deleted: false,
      scored: true,
    });
  });

  it('can set taskActivity options', async () => {
    body.type = 'taskActivity';
    body.options = {
      checklistScored: true,
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      checklistScored: true,
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    });
  });

  it('discards extra properties in taskActivity options', async () => {
    body.type = 'taskActivity';
    body.options = {
      checklistScored: false,
      created: true,
      updated: true,
      deleted: true,
      scored: false,
      foo: 'bar',
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({
      checklistScored: false,
      created: true,
      updated: true,
      deleted: true,
      scored: false,
    });
  });

  ['created', 'updated', 'deleted', 'scored'].forEach(option => {
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

    const webhook = await user.post('/user/webhook', body);

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
      message: apiError('groupIdRequired'),
    });
  });

  it('discards extra properties in groupChatReceived options', async () => {
    body.type = 'groupChatReceived';
    body.options = {
      groupId: generateUUID(),
      foo: 'bar',
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({
      groupId: body.options.groupId,
    });
  });

  it('defaults questActivity options', async () => {
    body.type = 'questActivity';

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      questStarted: false,
      questFinished: false,
      questInvited: false,
    });
  });

  it('can set questActivity options', async () => {
    body.type = 'questActivity';
    body.options = {
      questStarted: true,
      questFinished: true,
      questInvited: true,
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options).to.eql({
      questStarted: true,
      questFinished: true,
      questInvited: true,
    });
  });

  it('discards extra properties in questActivity options', async () => {
    body.type = 'questActivity';
    body.options = {
      questStarted: false,
      questFinished: true,
      questInvited: true,
      foo: 'bar',
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({
      questStarted: false,
      questFinished: true,
      questInvited: true,
    });
  });

  ['questStarted', 'questFinished', 'questInvited'].forEach(option => {
    it(`requires questActivity option ${option} to be a boolean`, async () => {
      body.type = 'questActivity';
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

  it('discards extra properties in globalActivity options', async () => {
    body.type = 'globalActivity';
    body.options = {
      foo: 'bar',
    };

    const webhook = await user.post('/user/webhook', body);

    expect(webhook.options.foo).to.not.exist;
    expect(webhook.options).to.eql({});
  });
});
