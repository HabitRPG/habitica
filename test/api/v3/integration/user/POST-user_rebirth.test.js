import {
  generateUser,
  generateDaily,
  generateReward,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/rebirth', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when user balance is too low', async () => {
    await expect(user.post('/user/rebirth'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('resets user\'s tasks', async () => {
    await user.update({
      balance: 1.5,
    });

    let daily = await generateDaily({
      text: 'test habit',
      type: 'daily',
      value: 1,
      streak: 1,
      userId: user._id,
    });

    let reward = await generateReward({
      text: 'test reward',
      type: 'reward',
      value: 1,
      userId: user._id,
    });

    let response = await user.post('/user/rebirth');
    await user.sync();

    expect(user.notifications.length).to.equal(1);
    expect(user.notifications[0].type).to.equal('REBIRTH_ACHIEVEMENT');

    let updatedDaily = await user.get(`/tasks/${daily._id}`);
    let updatedReward = await user.get(`/tasks/${reward._id}`);

    expect(response.message).to.equal(t('rebirthComplete'));
    expect(updatedDaily.streak).to.equal(0);
    expect(updatedDaily.value).to.equal(0);
    expect(updatedReward.value).to.equal(1);
  });
});
