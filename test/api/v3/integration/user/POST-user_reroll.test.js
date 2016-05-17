import {
  generateUser,
  generateDaily,
  generateReward,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/reroll', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when user balance is too low', async () => {
    await expect(user.post('/user/reroll'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('resets user\'s tasks', async () => {
    await user.update({
      balance: 2,
    });

    let daily = await generateDaily({
      text: 'test habit',
      type: 'daily',
      userId: user._id,
    });

    let reward = await generateReward({
      text: 'test reward',
      type: 'reward',
      value: 1,
      userId: user._id,
    });

    let response = await user.post('/user/reroll');
    await user.sync();

    let updatedDaily = await user.get(`/tasks/${daily._id}`);
    let updatedReward = await user.get(`/tasks/${reward._id}`);

    expect(response.message).to.equal(t('fortifyComplete'));
    expect(updatedDaily.value).to.equal(0);
    expect(updatedReward.value).to.equal(1);
  });
});
