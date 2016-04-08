import reroll from '../../../common/script/ops/reroll';
import {
  generateUser,
  generateTodo,
  generateReward,
} from '../../helpers/common.helper';
import i18n from '../../../common/script/i18n';

describe('shared.ops.reroll', () => {
  let user;
  let req = { language: 'en' };
  let cb;

  beforeEach(async () => {
    user = await generateUser({ balance: 5 });
    cb = () => {};
  });

  it('returns if notEnoughGems', () => {
    user.balance = 0;
    expect(user.balance).to.be.lessThan(1);
    cb = (args) => {
      expect(args.code).to.eql(401);
      expect(args.message).to.eql(i18n.t('notEnoughGems', req.language));
    };
    reroll({ user }, req, cb);
  });

  it('decrements user balance', () => {
    user.balance = 10;
    reroll({ user });
    expect(user.balance).to.eql(9);
  });

  it('resets task values to 0', async () => {
    let task = await generateTodo({ value: 1 });
    expect(task.value).to.not.eql(0);
    let tasks = [task];
    reroll({ user, tasks });
    expect(tasks[0].value).to.eql(0);
  });

  it('does not reset rewards\' values to 0', async () => {
    let reward = await generateReward({ value: 1 });
    expect(reward.value).to.not.eql(0);
    let tasks = [reward];
    reroll({ user, tasks });
    expect(reward.value).to.eql(1);
  });

  it('sets user\'s hp at 50', () => {
    user.stats.hp = 40;
    expect(user.stats.hp).to.not.eql(50);
    reroll({user});
    expect(user.stats.hp).to.eql(50);
  });

  it('emits analytics event', () => {
    let analytics = { track: (name, hash) => {
      expect(name).to.eql('Fortify Potion');
      expect(hash.uuid).to.eql(user._id);
      expect(hash.acquireMethod).to.eql('Gems');
      expect(hash.gemCost).to.eql(4);
      expect(hash.category).to.eql('behavior');
    }};
    reroll({user}, req, cb, analytics);
  });

  it('returns callback', () => {
    cb = (err, outUser) => {
      expect(err).to.eql(null);
      expect(outUser).to.eql(user);
    };
    reroll({user}, req, cb);
  });
});
