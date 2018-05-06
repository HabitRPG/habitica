/* eslint-disable camelcase */

import {
  generateUser,
  translate as t,
  server,
  sleep,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content';
import { v4 as generateUUID } from 'uuid';

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

    let food = content.food.Milk;
    let pet = content.petInfo['Wolf-Base'];

    let res = await user.post('/user/feed/Wolf-Base/Milk');
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

  context('sending user activity webhooks', () => {
    before(async () => {
      await server.start();
    });

    after(async () => {
      await server.close();
    });

    it('sends user activity webhook when a new mount is raised', async () => {
      let uuid = generateUUID();

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
      let res = await user.post('/user/feed/Wolf-Base/Milk');

      await sleep();

      let body = server.getWebhookData(uuid);

      expect(body.type).to.eql('mountRaised');
      expect(body.pet).to.eql('Wolf-Base');
      expect(body.message).to.eql(res.message);
    });
  });
});
