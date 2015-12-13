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

    it('Should add exp and gp to user when backstab is used', () => {
      const PREVIOUS_EXP = user.stats.exp;
      const PREVIOUS_GP = user.stats.gp;

      shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
      expect(user.stats.exp).to.be.greaterThan(PREVIOUS_EXP);
      expect(user.stats.gp).to.be.greaterThan(PREVIOUS_GP);
    });

    it('Should level user from 14 to 15 when backstab is used and user is about to level', () => {
      user.stats.exp = 349;
      user.stats.lvl = 14;
      user.stats.str = 5;
      user.stats.int = 5;
      user.stats.con = 4;
      user.stats.per = 0;

      shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(15);
    });

    it('Should level user from 29 to 30 when backstab is used and user is about to level', () => {
      user.stats.exp = 659;
      user.stats.lvl = 29;
      user.stats.str = 9;
      user.stats.int = 5;
      user.stats.con = 5;
      user.stats.per = 5;
      shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(30);
    });

    it('Should level user from 39 to 40 when backstab is used and user is about to level', () => {
      user.stats.exp = 939;
      user.stats.lvl = 39;
      user.stats.str = 10;
      user.stats.int = 10;
      user.stats.con = 10;
      user.stats.per = 9;
      shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(40);
    });

    it('Should level user from 59 to 60 when backstab is used and user is about to level', () => {
      user.stats.exp = 1639;
      user.stats.lvl = 59;
      user.stats.str = 15;
      user.stats.int = 15;
      user.stats.con = 15;
      user.stats.per = 14;
      shared.content.spells.rogue.backStab.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(60);
    });
  });

  context('Wizard Spells', () => {
    beforeEach(() => {
      user.stats.class = 'wizard';
    });

    it('Should add exp to user when fireball (Burst of Flames) is used', () => {
      const PREVIOUS_EXP = user.stats.exp;

      shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
      expect(user.stats.exp).to.be.greaterThan(PREVIOUS_EXP);
    });

    it('Should level user from 14 to 15 when fireball (Burst of Flames) is used and user is about to level', () => {
      user.stats.exp = 349;
      user.stats.lvl = 14;
      user.stats.str = 5;
      user.stats.int = 5;
      user.stats.con = 4;
      user.stats.per = 0;
      shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(15);
    });

    it('Should level user from 29 to 30 when fireball (Burst of Flames) is used and user is about to level', () => {
      user.stats.exp = 659;
      user.stats.lvl = 29;
      user.stats.str = 9;
      user.stats.int = 5;
      user.stats.con = 5;
      user.stats.per = 5;
      shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(30);
    });

    it('Should level user from 39 to 40 when fireball (Burst of Flames) is used and user is about to level', () => {
      user.stats.exp = 939;
      user.stats.lvl = 39;
      user.stats.str = 10;
      user.stats.int = 10;
      user.stats.con = 10;
      user.stats.per = 9;
      shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(40);
    });

    it('Should level user from 59 to 60 when fireball (Burst of Flames) is used and user is about to level', () => {
      user.stats.exp = 1639;
      user.stats.lvl = 59;
      user.stats.str = 15;
      user.stats.int = 15;
      user.stats.con = 15;
      user.stats.per = 14;
      shared.content.spells.wizard.fireball.cast(user, user.todos[0]);
      expect(user.stats.lvl).to.eql(60);
    });
  });
});
