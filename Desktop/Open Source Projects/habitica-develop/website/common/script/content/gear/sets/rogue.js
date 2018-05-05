import t from '../../translation';

let armor = {
  1: {
    text: t('armorRogue1Text'),
    notes: t('armorRogue1Notes', { per: 6 }),
    per: 6,
    value: 30,
  },
  2: {
    text: t('armorRogue2Text'),
    notes: t('armorRogue2Notes', { per: 9 }),
    per: 9,
    value: 45,
  },
  3: {
    text: t('armorRogue3Text'),
    notes: t('armorRogue3Notes', { per: 12 }),
    per: 12,
    value: 65,
  },
  4: {
    text: t('armorRogue4Text'),
    notes: t('armorRogue4Notes', { per: 15 }),
    per: 15,
    value: 90,
  },
  5: {
    text: t('armorRogue5Text'),
    notes: t('armorRogue5Notes', { per: 18 }),
    per: 18,
    value: 120,
    last: true,
  },
};

let head = {
  1: {
    text: t('headRogue1Text'),
    notes: t('headRogue1Notes', { per: 2 }),
    per: 2,
    value: 15,
  },
  2: {
    text: t('headRogue2Text'),
    notes: t('headRogue2Notes', { per: 4 }),
    per: 4,
    value: 25,
  },
  3: {
    text: t('headRogue3Text'),
    notes: t('headRogue3Notes', { per: 6 }),
    per: 6,
    value: 40,
  },
  4: {
    text: t('headRogue4Text'),
    notes: t('headRogue4Notes', { per: 9 }),
    per: 9,
    value: 60,
  },
  5: {
    text: t('headRogue5Text'),
    notes: t('headRogue5Notes', { per: 12 }),
    per: 12,
    value: 80,
    last: true,
  },
};

let weapon = {
  0: {
    text: t('weaponRogue0Text'),
    notes: t('weaponRogue0Notes'),
    str: 0,
    value: 0,
  },
  1: {
    text: t('weaponRogue1Text'),
    notes: t('weaponRogue1Notes', { str: 2 }),
    str: 2,
    value: 20,
  },
  2: {
    text: t('weaponRogue2Text'),
    notes: t('weaponRogue2Notes', { str: 3 }),
    str: 3,
    value: 35,
  },
  3: {
    text: t('weaponRogue3Text'),
    notes: t('weaponRogue3Notes', { str: 4 }),
    str: 4,
    value: 50,
  },
  4: {
    text: t('weaponRogue4Text'),
    notes: t('weaponRogue4Notes', { str: 6 }),
    str: 6,
    value: 70,
  },
  5: {
    text: t('weaponRogue5Text'),
    notes: t('weaponRogue5Notes', { str: 8 }),
    str: 8,
    value: 90,
  },
  6: {
    text: t('weaponRogue6Text'),
    notes: t('weaponRogue6Notes', { str: 10 }),
    str: 10,
    value: 120,
    last: true,
  },
};

let shield = {
  0: {
    text: t('weaponRogue0Text'),
    notes: t('weaponRogue0Notes'),
    str: 0,
    value: 0,
  },
  1: {
    text: t('weaponRogue1Text'),
    notes: t('weaponRogue1Notes', { str: 2 }),
    str: 2,
    value: 20,
  },
  2: {
    text: t('weaponRogue2Text'),
    notes: t('weaponRogue2Notes', { str: 3 }),
    str: 3,
    value: 35,
  },
  3: {
    text: t('weaponRogue3Text'),
    notes: t('weaponRogue3Notes', { str: 4 }),
    str: 4,
    value: 50,
  },
  4: {
    text: t('weaponRogue4Text'),
    notes: t('weaponRogue4Notes', { str: 6 }),
    str: 6,
    value: 70,
  },
  5: {
    text: t('weaponRogue5Text'),
    notes: t('weaponRogue5Notes', { str: 8 }),
    str: 8,
    value: 90,
  },
  6: {
    text: t('weaponRogue6Text'),
    notes: t('weaponRogue6Notes', { str: 10 }),
    str: 10,
    value: 120,
    last: true,
  },
};

let rogueSet = {
  armor,
  head,
  shield,
  weapon,
};

module.exports = rogueSet;
