import t from '../../translation';

const armor = {
  1: {
    text: t('armorRogue1Text'),
    notes: t('armorRogue1Notes', { per: 6 }),
    per: 6,
    value: 30,
    canBuy: () => true,
  },
  2: {
    text: t('armorRogue2Text'),
    notes: t('armorRogue2Notes', { per: 9 }),
    per: 9,
    value: 45,
    canBuy: () => true,
  },
  3: {
    text: t('armorRogue3Text'),
    notes: t('armorRogue3Notes', { per: 12 }),
    per: 12,
    value: 65,
    canBuy: () => true,
  },
  4: {
    text: t('armorRogue4Text'),
    notes: t('armorRogue4Notes', { per: 15 }),
    per: 15,
    value: 90,
    canBuy: () => true,
  },
  5: {
    text: t('armorRogue5Text'),
    notes: t('armorRogue5Notes', { per: 18 }),
    per: 18,
    value: 120,
    last: true,
    canBuy: () => true,
  },
};

const head = {
  1: {
    text: t('headRogue1Text'),
    notes: t('headRogue1Notes', { per: 2 }),
    per: 2,
    value: 15,
    canBuy: () => true,
  },
  2: {
    text: t('headRogue2Text'),
    notes: t('headRogue2Notes', { per: 4 }),
    per: 4,
    value: 25,
    canBuy: () => true,
  },
  3: {
    text: t('headRogue3Text'),
    notes: t('headRogue3Notes', { per: 6 }),
    per: 6,
    value: 40,
    canBuy: () => true,
  },
  4: {
    text: t('headRogue4Text'),
    notes: t('headRogue4Notes', { per: 9 }),
    per: 9,
    value: 60,
    canBuy: () => true,
  },
  5: {
    text: t('headRogue5Text'),
    notes: t('headRogue5Notes', { per: 12 }),
    per: 12,
    value: 80,
    last: true,
    canBuy: () => true,
  },
};

const weapon = {
  0: {
    text: t('weaponRogue0Text'),
    notes: t('weaponRogue0Notes'),
    str: 0,
    value: 0,
    canBuy: () => true,
  },
  1: {
    text: t('weaponRogue1Text'),
    notes: t('weaponRogue1Notes', { str: 2 }),
    str: 2,
    value: 20,
    canBuy: () => true,
  },
  2: {
    text: t('weaponRogue2Text'),
    notes: t('weaponRogue2Notes', { str: 3 }),
    str: 3,
    value: 35,
    canBuy: () => true,
  },
  3: {
    text: t('weaponRogue3Text'),
    notes: t('weaponRogue3Notes', { str: 4 }),
    str: 4,
    value: 50,
    canBuy: () => true,
  },
  4: {
    text: t('weaponRogue4Text'),
    notes: t('weaponRogue4Notes', { str: 6 }),
    str: 6,
    value: 70,
    canBuy: () => true,
  },
  5: {
    text: t('weaponRogue5Text'),
    notes: t('weaponRogue5Notes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => true,
  },
  6: {
    text: t('weaponRogue6Text'),
    notes: t('weaponRogue6Notes', { str: 10 }),
    str: 10,
    value: 120,
    last: true,
    canBuy: () => true,
  },
};

const shield = {
  0: {
    text: t('weaponRogue0Text'),
    notes: t('weaponRogue0Notes'),
    str: 0,
    value: 0,
    canBuy: () => true,
  },
  1: {
    text: t('weaponRogue1Text'),
    notes: t('weaponRogue1Notes', { str: 2 }),
    str: 2,
    value: 20,
    canBuy: () => true,
  },
  2: {
    text: t('weaponRogue2Text'),
    notes: t('weaponRogue2Notes', { str: 3 }),
    str: 3,
    value: 35,
    canBuy: () => true,
  },
  3: {
    text: t('weaponRogue3Text'),
    notes: t('weaponRogue3Notes', { str: 4 }),
    str: 4,
    value: 50,
    canBuy: () => true,
  },
  4: {
    text: t('weaponRogue4Text'),
    notes: t('weaponRogue4Notes', { str: 6 }),
    str: 6,
    value: 70,
    canBuy: () => true,
  },
  5: {
    text: t('weaponRogue5Text'),
    notes: t('weaponRogue5Notes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => true,
  },
  6: {
    text: t('weaponRogue6Text'),
    notes: t('weaponRogue6Notes', { str: 10 }),
    str: 10,
    value: 120,
    last: true,
    canBuy: () => true,
  },
};

export {
  armor,
  head,
  shield,
  weapon,
};
