/* eslint-disable camelcase */
let shared = require('../../common/script/index.js');

let newUser = (addTasks = true) => {
  let buffs;
  let user;

  buffs = {
    per: 0,
    int: 0,
    con: 0,
    str: 0,
    stealth: 0,
    streaks: false,
  };
  user = {
    // auth: {
    //   timestamps: {},
    // },
    stats: {
      str: 1,
      con: 1,
      per: 1,
      int: 1,
      mp: 32,
      lvl: 1,
      class: 'rogue',
      buffs,
    },
    items: {
      // lastDrop: {
      //   count: 0,
      // },
      // hatchingPotions: {},
      eggs: {},
      // food: {},
      gear: {
        equipped: {},
        costume: {},
      },
      quests: {},
    },
    party: {
      quest: {
        progress: {
          down: 0,
        },
      },
    },
    preferences: {},
    habits: [],
    dailys: [],
    todos: [],
    rewards: [],
    // flags: {},
    achievements: {},
    // contributor: {
    //   level: 100,
    // },
  };
  shared.wrap(user);
  user.ops.reset(null, () => {});
  if (addTasks) {
    _.each(['habit', 'todo', 'daily'], (task) => {
      user.ops.addTask({
        body: {
          type: task,
          id: shared.uuid(),
        },
      });
    });
  }
  return user;
};

describe('Spells', () => {
  let user;

  beforeEach(() => {
    user = newUser();
    shared.wrap(user);
  });

  context('Rogue Spells', () => {
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
      let PREVIOUS_EXP = user.stats.exp;

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
