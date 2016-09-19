import randomDrop from '../../../common/script/fns/randomDrop';
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
    task = generateTodo({ userId: user._id });
    predictableRandom = () => {
      return 0.5;
    };
  });

  it('drops an item for the user.party.quest.progress', () => {
    expect(user.party.quest.progress.collectedItems).to.eql(0);
    user.party.quest.key = 'vice2';
    predictableRandom = () => {
      return 0.0001;
    };
    randomDrop(user, { task, predictableRandom });
    expect(user.party.quest.progress.collectedItems).to.eql(1);
    randomDrop(user, { task, predictableRandom });
    expect(user.party.quest.progress.collectedItems).to.eql(2);
  });

  context('drops enabled', () => {
    beforeEach(() => {
      user.flags.dropsEnabled = true;
      task.priority = 100000;
    });

    it('does nothing if user.items.lastDrop.count is exceeded', () => {
      user.items.lastDrop.count = 100;
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.eql({});
    });

    it('drops something when the task is a todo', () => {
      expect(user._tmp).to.eql({});
      user.flags.dropsEnabled = true;
      predictableRandom = () => {
        return 0.1;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a habit', () => {
      task = generateHabit({ userId: user._id });
      expect(user._tmp).to.eql({});
      user.flags.dropsEnabled = true;
      predictableRandom = () => {
        return 0.1;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a daily', () => {
      task = generateDaily({ userId: user._id });
      expect(user._tmp).to.eql({});
      user.flags.dropsEnabled = true;
      predictableRandom = () => {
        return 0.1;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops something when the task is a reward', () => {
      task = generateReward({ userId: user._id });
      expect(user._tmp).to.eql({});
      user.flags.dropsEnabled = true;
      predictableRandom = () => {
        return 0.1;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp).to.not.eql({});
    });

    it('drops food', () => {
      predictableRandom = () => {
        return 0.65;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp.drop.type).to.eql('Food');
    });

    it('drops eggs', () => {
      predictableRandom = () => {
        return 0.35;
      };
      randomDrop(user, { task, predictableRandom });
      expect(user._tmp.drop.type).to.eql('Egg');
    });

    context('drops hatching potion', () => {
      it('drops a very rare potion', () => {
        predictableRandom = () => {
          return 0.01;
        };
        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(5);
        expect(user._tmp.drop.key).to.eql('Golden');
      });

      it('drops a rare potion', () => {
        predictableRandom = () => {
          return 0.08;
        };
        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(4);
        let acceptableDrops = ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'];
        expect(acceptableDrops).to.contain(user._tmp.drop.key); // deterministically 'CottonCandyBlue'
      });

      it('drops an uncommon potion', () => {
        predictableRandom = () => {
          return 0.17;
        };
        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(3);
        let acceptableDrops = ['Red', 'Shade', 'Skeleton'];
        expect(acceptableDrops).to.contain(user._tmp.drop.key); // always skeleton
      });

      it('drops a common potion', () => {
        predictableRandom = () => {
          return 0.20;
        };
        randomDrop(user, { task, predictableRandom });
        expect(user._tmp.drop.type).to.eql('HatchingPotion');
        expect(user._tmp.drop.value).to.eql(2);
        let acceptableDrops = ['Base', 'White', 'Desert'];
        expect(acceptableDrops).to.contain(user._tmp.drop.key); // always Desert
      });
    });
  });
});
