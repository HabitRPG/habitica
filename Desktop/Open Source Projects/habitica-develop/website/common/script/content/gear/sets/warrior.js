import t from '../../translation';

let armor = {
  1: {
    text: t('armorWarrior1Text'),
    notes: t('armorWarrior1Notes', { con: 3 }),
    con: 3,
    value: 30,
  },
  2: {
    text: t('armorWarrior2Text'),
    notes: t('armorWarrior2Notes', { con: 5 }),
    con: 5,
    value: 45,
  },
  3: {
    text: t('armorWarrior3Text'),
    notes: t('armorWarrior3Notes', { con: 7 }),
    con: 7,
    value: 65,
  },
  4: {
    text: t('armorWarrior4Text'),
    notes: t('armorWarrior4Notes', { con: 9 }),
    con: 9,
    value: 90,
  },
  5: {
    text: t('armorWarrior5Text'),
    notes: t('armorWarrior5Notes', { con: 11 }),
    con: 11,
    value: 120,
    last: true,
  },
};

let head = {
  1: {
    text: t('headWarrior1Text'),
    notes: t('headWarrior1Notes', { str: 2 }),
    str: 2,
    value: 15,
  },
  2: {
    text: t('headWarrior2Text'),
    notes: t('headWarrior2Notes', { str: 4 }),
    str: 4,
    value: 25,
  },
  3: {
    text: t('headWarrior3Text'),
    notes: t('headWarrior3Notes', { str: 6 }),
    str: 6,
    value: 40,
  },
  4: {
    text: t('headWarrior4Text'),
    notes: t('headWarrior4Notes', { str: 9 }),
    str: 9,
    value: 60,
  },
  5: {
    text: t('headWarrior5Text'),
    notes: t('headWarrior5Notes', { str: 12 }),
    str: 12,
    value: 80,
    last: true,
  },
};

let shield = {
  1: {
    text: t('shieldWarrior1Text'),
    notes: t('shieldWarrior1Notes', { con: 2 }),
    con: 2,
    value: 20,
  },
  2: {
    text: t('shieldWarrior2Text'),
    notes: t('shieldWarrior2Notes', { con: 3 }),
    con: 3,
    value: 35,
  },
  3: {
    text: t('shieldWarrior3Text'),
    notes: t('shieldWarrior3Notes', { con: 5 }),
    con: 5,
    value: 50,
  },
  4: {
    text: t('shieldWarrior4Text'),
    notes: t('shieldWarrior4Notes', { con: 7 }),
    con: 7,
    value: 70,
  },
  5: {
    text: t('shieldWarrior5Text'),
    notes: t('shieldWarrior5Notes', { con: 9 }),
    con: 9,
    value: 90,
    last: true,
  },
};

let weapon = {
  0: {
    text: t('weaponWarrior0Text'),
    notes: t('weaponWarrior0Notes'), value: 1 },
  1: {
    text: t('weaponWarrior1Text'),
    notes: t('weaponWarrior1Notes', { str: 3 }),
    str: 3,
    value: 20,
  },
  2: {
    text: t('weaponWarrior2Text'),
    notes: t('weaponWarrior2Notes', { str: 6 }),
    str: 6,
    value: 30,
  },
  3: {
    text: t('weaponWarrior3Text'),
    notes: t('weaponWarrior3Notes', { str: 9 }),
    str: 9,
    value: 45,
  },
  4: {
    text: t('weaponWarrior4Text'),
    notes: t('weaponWarrior4Notes', { str: 12 }),
    str: 12,
    value: 65,
  },
  5: {
    text: t('weaponWarrior5Text'),
    notes: t('weaponWarrior5Notes', { str: 15 }),
    str: 15,
    value: 90,
  },
  6: {
    text: t('weaponWarrior6Text'),
    notes: t('weaponWarrior6Notes', { str: 18 }),
    str: 18,
    value: 120,
    last: true,
  },
};

let warriorSet = {
  armor,
  head,
  shield,
  weapon,
};

module.exports = warriorSet;
