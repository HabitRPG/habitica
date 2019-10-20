import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/purchase-hourglass/:type/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'purchased.plan.consecutive.trinkets': 2,
    });
  });

  // More tests in common code unit tests

  it('buys an hourglass pet', async () => {
    const response = await user.post('/user/purchase-hourglass/pets/MantisShrimp-Base');
    await user.sync();

    expect(response.message).to.eql(t('hourglassPurchase'));
    expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
    expect(user.items.pets['MantisShrimp-Base']).to.eql(5);
  });

  it('buys an hourglass quest', async () => {
    const response = await user.post('/user/purchase-hourglass/quests/robot');
    await user.sync();

    expect(response.message).to.eql(t('hourglassPurchase'));
    expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
    expect(user.items.quests.robot).to.eql(1);
  });

  it('buys multiple hourglass quests', async () => {
    const response = await user.post('/user/purchase-hourglass/quests/robot', { quantity: 2 });
    await user.sync();

    expect(response.message).to.eql(t('hourglassPurchase'));
    expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
    expect(user.items.quests.robot).to.eql(2);
  });
});
