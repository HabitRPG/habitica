import t from '../../translation';

const armor = {
  1: {
    text: t('armorWizard1Text'),
    notes: t('armorWizard1Notes', { int: 2 }),
    int: 2,
    value: 30,
    canBuy: () => true,
  },
  2: {
    text: t('armorWizard2Text'),
    notes: t('armorWizard2Notes', { int: 4 }),
    int: 4,
    value: 45,
    canBuy: () => true,
  },
  3: {
    text: t('armorWizard3Text'),
    notes: t('armorWizard3Notes', { int: 6 }),
    int: 6,
    value: 65,
    canBuy: () => true,
  },
  4: {
    text: t('armorWizard4Text'),
    notes: t('armorWizard4Notes', { int: 9 }),
    int: 9,
    value: 90,
    canBuy: () => true,
  },
  5: {
    text: t('armorWizard5Text'),
    notes: t('armorWizard5Notes', { int: 12 }),
    int: 12,
    value: 120,
    last: true,
    canBuy: () => true,
  },
};

const head = {
  1: {
    text: t('headWizard1Text'),
    notes: t('headWizard1Notes', { per: 2 }),
    per: 2,
    value: 15,
    canBuy: () => true,
  },
  2: {
    text: t('headWizard2Text'),
    notes: t('headWizard2Notes', { per: 3 }),
    per: 3,
    value: 25,
    canBuy: () => true,
  },
  3: {
    text: t('headWizard3Text'),
    notes: t('headWizard3Notes', { per: 5 }),
    per: 5,
    value: 40,
    canBuy: () => true,
  },
  4: {
    text: t('headWizard4Text'),
    notes: t('headWizard4Notes', { per: 7 }),
    per: 7,
    value: 60,
    canBuy: () => true,
  },
  5: {
    text: t('headWizard5Text'),
    notes: t('headWizard5Notes', { per: 10 }),
    per: 10,
    value: 80,
    last: true,
    canBuy: () => true,
  },
};

const shield = {
  // Wizard's weapons are two handed
  // And thus do not have shields
  // But the content structure still expects an object
};

const weapon = {

  0: {
    twoHanded: true,
    text: t('weaponWizard0Text'),
    notes: t('weaponWizard0Notes'),
    value: 0,
    canBuy: () => true,
  },
  1: {
    twoHanded: true,
    text: t('weaponWizard1Text'),
    notes: t('weaponWizard1Notes', { int: 3, per: 1 }),
    int: 3,
    per: 1,
    value: 30,
    canBuy: () => true,
  },
  2: {
    twoHanded: true,
    text: t('weaponWizard2Text'),
    notes: t('weaponWizard2Notes', { int: 6, per: 2 }),
    int: 6,
    per: 2,
    value: 50,
    canBuy: () => true,
  },
  3: {
    twoHanded: true,
    text: t('weaponWizard3Text'),
    notes: t('weaponWizard3Notes', { int: 9, per: 3 }),
    int: 9,
    per: 3,
    value: 80,
    canBuy: () => true,
  },
  4: {
    twoHanded: true,
    text: t('weaponWizard4Text'),
    notes: t('weaponWizard4Notes', { int: 12, per: 5 }),
    int: 12,
    per: 5,
    value: 120,
    canBuy: () => true,
  },
  5: {
    twoHanded: true,
    text: t('weaponWizard5Text'),
    notes: t('weaponWizard5Notes', { int: 15, per: 7 }),
    int: 15,
    per: 7,
    value: 160,
    canBuy: () => true,
  },
  6: {
    twoHanded: true,
    text: t('weaponWizard6Text'),
    notes: t('weaponWizard6Notes', { int: 18, per: 10 }),
    int: 18,
    per: 10,
    value: 200,
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
