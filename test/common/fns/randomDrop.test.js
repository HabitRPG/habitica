import randomDrop from '../../../website/common/script/fns/randomDrop';
import {
  generateUser,
  generateTodo,
  generateHabit,
  generateDaily,
  generateReward,
} from '../../helpers/common.helper';

describe('common.fns.randomDrop', () => {
  let user;
  let task;
  let predictableRandom;

  beforeEach(() => {
    user = generateUser();
    user._tmp = user._tmp ? user._tmp : {};
    user.items.eggs.Wolf = 0;
    user.items.food.Meat = 0;
    user._id = `a${user._id.slice(1)}`;
    task = generateTodo({ userId: user._id });
    predictableRandom = sandbox.stub().returns(0.5);
  });

  it('drops an item for the user.party.quest.progress', () => {
    expect(user.party.quest.progress.collectedItems).to.eql(0);
    user.party.quest.key = 'vice2';
    predictableRandom.returns(0.0001);

    randomDrop(user, { task, predictableRandom });
    expect(user.party.quest.progress.collectedItems).to.eql(1);
    expect(user._tmp.quest.collection).to.eql(1);
    randomDrop(user, { task, predictableRandom });
    expect(user.party.quest.progress.collectedItems).to.eql(2);
    expect(user._tmp.quest.collection).to.eql(1);
  });

  context('drops enabled', () => {
    beforeEach(() => {
      task.priority = 100000;
    });

    it('awards an egg and a hatching potion if user has never received any', () => {
      delete user.items.eggs.Wolf;
      randomDrop(user, { task, predictableRandom });

      expect(user._tmp.firstDrops.egg).to.be.a.string;
      expect(user._tmp.firstDrops.hatchingPotion).to.be.a.string;
    });

    it('does nothing if user.items.lastDrop.count is exceeded', () => {
      user.items.lastDrop.count = 100;
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp.drop).to.be.undefined;
    });

    it('drops something when the task is a todo', () => {
      expect(user._tmp).to.eql({});
      predictableRandom.returns(0.1);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a habit', () => {
      task = generateHabit({ userId: user._id });
      expect(user._tmp).to.eql({});
      predictableRandom.returns(0.1);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a daily', () => {
      task = generateDaily({ userId: user._id });
      expect(user._tmp).to.eql({});
      predictableRandom.returns(0.1);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a reward', () => {
      task = generateReward({ userId: user._id });
      expect(user._tmp).to.eql({});
      predictableRandom.returns(0.1);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops food', () => {
      predictableRandom.returns(0.65);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp.drop.type).to.eql('Food');
    });

    it('drops eggs', () => {
      predictableRandom.returns(0.35);

      randomDrop(user, { task, predictableRandom });
      expect(user._tmp.drop.type).to.eql('Egg');
    });

    context('drops hatching potion', () => {
      it('drops a very rare potion', () => {
        predictableRandom.returns(0.01);

        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(5);
        expect(user._tmp.drop.key).to.eql('Golden');
      });

      it('drops a rare potion', () => {
        predictableRandom.returns(0.08);

        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(4);
        const acceptableDrops = ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'];
        // deterministically 'CottonCandyBlue'
        expect(acceptableDrops).to.contain(user._tmp.drop.key);
      });

      it('drops an uncommon potion', () => {
        predictableRandom.returns(0.17);

        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(3);
        const acceptableDrops = ['Red', 'Shade', 'Skeleton'];
        expect(acceptableDrops).to.contain(user._tmp.drop.key); // always skeleton
      });

      it('drops a common potion', () => {
        predictableRandom.returns(0.20);

        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(2);
        const acceptableDrops = ['Base', 'White', 'Desert'];
        expect(acceptableDrops).to.contain(user._tmp.drop.key); // always Desert
      });
    });
  });
});
