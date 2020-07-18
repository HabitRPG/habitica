/* eslint-disable camelcase */

import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
  server,
  sleep,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content';

describe('POST /user/feed/:pet/:food', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('does not enjoy the food', async () => {
    await user.update({
      'items.pets.Wolf-Base': 5,
      'items.food.Milk': 2,
    });

    const food = content.food.Milk;
    const pet = content.petInfo['Wolf-Base'];

    const res = await user.post('/user/feed/Wolf-Base/Milk');
    await user.sync();
    expect(res).to.eql({
      data: user.items.pets['Wolf-Base'],
      message: t('messageDontEnjoyFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }),
    });

    expect(user.items.food.Milk).to.equal(1);
    expect(user.items.pets['Wolf-Base']).to.equal(7);
  });

  it('bulk feeding pet with non-preferred food', async () => {
    await user.update({
      'items.pets.Wolf-Base': 5,
      'items.food.Milk': 3,
    });

    const food = content.food.Milk;
    const pet = content.petInfo['Wolf-Base'];

    const res = await user.post('/user/feed/Wolf-Base/Milk?amount=2');
    await user.sync();
    expect(res).to.eql({
      data: user.items.pets['Wolf-Base'],
      message: t('messageDontEnjoyFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }),
    });

    expect(user.items.food.Milk).to.eql(1);
    expect(user.items.pets['Wolf-Base']).to.equal(9);
  });

  context('sending user activity webhooks', () => {
    before(async () => {
      await server.start();
    });

    after(async () => {
      await server.close();
    });

    it('sends user activity webhook when a new mount is raised', async () => {
      const uuid = generateUUID();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'userActivity',
        enabled: true,
        options: {
          mountRaised: true,
        },
      });

      await user.update({
        'items.pets.Wolf-Base': 49,
        'items.food.Milk': 2,
      });
      const res = await user.post('/user/feed/Wolf-Base/Milk');

      await sleep();

      const body = server.getWebhookData(uuid);

      expect(user.achievements.allYourBase).to.not.equal(true);
      expect(body.type).to.eql('mountRaised');
      expect(body.pet).to.eql('Wolf-Base');
      expect(body.message).to.eql(res.message);
    });

    it('sends user activity webhook (mount raised after full bulk feeding)', async () => {
      const uuid = generateUUID();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'userActivity',
        enabled: true,
        options: {
          mountRaised: true,
        },
      });

      await user.update({
        'items.pets.Wolf-Base': 47,
        'items.food.Milk': 3,
      });
      const res = await user.post('/user/feed/Wolf-Base/Milk?amount=2');

      await sleep();

      const body = server.getWebhookData(uuid);

      expect(user.achievements.allYourBase).to.not.equal(true);
      expect(body.type).to.eql('mountRaised');
      expect(body.pet).to.eql('Wolf-Base');
      expect(body.message).to.eql(res.message);
    });
  });
});
