import { generateUser } from '../../../../helpers/api-integration/v3';

describe('GET /user/webhook', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();

    await user.post('/user/webhook', {
      url: 'http://some-url.com',
      label: 'Label',
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

  it('returns users webhooks', async () => {
    const response = await user.get('/user/webhook');

    expect(response).to.eql(user.webhooks.map(w => {
      w.createdAt = w.createdAt.toISOString();
      w.updatedAt = w.updatedAt.toISOString();
      return w;
    }));
  });
});
