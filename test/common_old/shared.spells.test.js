import shared from '../../common/script/index.js';
import {
  generateUser,
  generateTodo,
} from '../helpers/common.helper';


describe('Spells', () => {
  let user;

  beforeEach(() => {
    let todo = generateTodo();

    user = generateUser({
      stats: {
        int: 20,
        str: 20,
        con: 20,
        per: 20,
        lvl: 20,
      },
    });
    user.todos.push(todo);
  });

  context('Rogue Spells', () => {
    beforeEach(() => {
      user.stats.class = 'rogue';
    });

    describe('#backstab', () => {
      it('adds exp to user', () => {
        const PREVIOUS_EXP = user.stats.exp;

        shared.content.spells.rogue.backStab.cast(user, user.todos[0]);

        expect(user.stats.exp).to.be.greaterThan(PREVIOUS_EXP);
      });

      it('adds gp to user', () => {
        const PREVIOUS_GP = user.stats.gp;

        shared.content.spells.rogue.backStab.cast(user, user.todos[0]);

        expect(user.stats.gp).to.be.greaterThan(PREVIOUS_GP);
      });

      it('levels up user if the gain in experience will level up the user', () => {
        user.stats.exp = 399;
        user.stats.lvl = 17;

        shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
        expect(user.stats.lvl).to.eql(18);
      });

      it('adds quest scroll to inventory when passing level milestone', () => {
        user.stats.exp = 329;
        user.stats.lvl = 14;

        expect(user.items.quests).to.not.have.property('atom1');

        shared.content.spells.rogue.backStab.cast(user, user.todos[0]);

        expect(user.items.quests).to.have.property('atom1', 1);
      });
    });
  });

  context('Wizard Spells', () => {
    beforeEach(() => {
      user.stats.class = 'wizard';
    });

    describe('#fireball (Burst of flames)', () => {
      it('adds exp to user', () => {
        const PREVIOUS_EXP = user.stats.exp;

        shared.content.spells.wizard.fireball.cast(user, user.todos[0]);

        expect(user.stats.exp).to.be.greaterThan(PREVIOUS_EXP);
      });

      it('levels up user if the gain in experience will level up the user', () => {
        user.stats.exp = 399;
        user.stats.lvl = 17;

        shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
        expect(user.stats.lvl).to.eql(18);
      });

      it('adds quest scroll to inventory when passing level milestone', () => {
        user.stats.exp = 329;
        user.stats.lvl = 14;

        expect(user.items.quests).to.not.have.property('atom1');

        shared.content.spells.wizard.fireball.cast(user, user.todos[0]);

        expect(user.items.quests).to.have.property('atom1', 1);
      });
    });
  });
});
