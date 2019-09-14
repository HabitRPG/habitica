import { generateUser } from '../../../../helpers/api-integration/v3';

describe('GET /user/webhook', () => {
  let user, webhooks;

  beforeEach(async () => {
    user = await generateUser();

    webhooks = [];
    webhooks.push(await user.post('/user/webhook', {
      url: 'http://some-url.com',
      label: 'Label',
      enabled: true,
      type: 'taskActivity',
      options: { created: true, scored: true },
    }));
    webhooks.push(await user.post('/user/webhook', {
      url: 'http://some-other-url.com',
      enabled: false,
    }));

    await user.sync();
  });

  it('returns users webhooks', async () => {
    let response = await user.get('/user/webhook');

    // updatedAt times don't match for some reason, so need to omit those from comparison
    let omitUpdatedAt = a => a.map(v => _.omit(v, 'updatedAt'));

    expect(omitUpdatedAt(response)).to.eql(omitUpdatedAt(webhooks));
  });
});
