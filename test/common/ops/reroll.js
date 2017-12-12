import reroll from '../../../website/common/script/ops/reroll';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
  generateDaily,
  generateReward,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.reroll', () => {
  let user;
  let tasks = [];

  beforeEach(() => {
    user = generateUser();
    user.balance = 1;
    tasks = [generateDaily(), generateReward()];
  });

  it('returns an error when user balance is too low', (done) => {
    user.balance = 0;

    try {
      reroll(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('rerolls a user with enough gems', () => {
    let [, message] = reroll(user);

    expect(message).to.equal(i18n.t('fortifyComplete'));
  });

  it('reduces a user\'s balance', () => {
    reroll(user);

    expect(user.balance).to.equal(0);
  });

  it('resets a user\'s health points', () => {
    user.stats.hp = 40;

    reroll(user);

    expect(user.stats.hp).to.equal(50);
  });

  it('resets user\'s taks values except for rewards to 0', () => {
    tasks[0].value = 1;
    tasks[1].value = 1;

    reroll(user, tasks);

    expect(tasks[0].value).to.equal(0);
    expect(tasks[1].value).to.equal(1);
  });
});
