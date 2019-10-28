import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
  server,
  sleep,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/hatch/:egg/:hatchingPotion', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('hatch a new pet', async () => {
    await user.update({
      'items.eggs.Wolf': 1,
      'items.hatchingPotions.Base': 1,
    });
    const res = await user.post('/user/hatch/Wolf/Base');
    await user.sync();
    expect(user.items.pets['Wolf-Base']).to.equal(5);
    expect(user.items.eggs.Wolf).to.equal(0);
    expect(user.items.hatchingPotions.Base).to.equal(0);
    expect(user.achievements.backToBasics).to.not.equal(true);

    expect(res).to.eql({
      message: t('messageHatched'),
      data: JSON.parse(JSON.stringify(user.items)),
    });
  });

  context('sending user activity webhooks', () => {
    before(async () => {
      await server.start();
    });

    after(async () => {
      await server.close();
    });

    it('sends user activity webhook when a new pet is hatched', async () => {
      const uuid = generateUUID();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'userActivity',
        enabled: true,
        options: {
          petHatched: true,
        },
      });

      await user.update({
        'items.eggs.Wolf': 1,
        'items.hatchingPotions.Base': 1,
      });
      const res = await user.post('/user/hatch/Wolf/Base');

      await sleep();

      const body = server.getWebhookData(uuid);

      expect(body.type).to.eql('petHatched');
      expect(body.pet).to.eql('Wolf-Base');
      expect(body.message).to.eql(res.message);
    });
  });
});
