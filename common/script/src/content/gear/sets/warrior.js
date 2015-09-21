import t from '../../helpers/translator';
import events from '../../events';

export var armor = {
  1: {
    text: t('armorWarrior1Text'),
    notes: t('armorWarrior1Notes', {
      con: 3
    }),
    con: 3,
    value: 30
  },
  2: {
    text: t('armorWarrior2Text'),
    notes: t('armorWarrior2Notes', {
      con: 5
    }),
    con: 5,
    value: 45
  },
  3: {
    text: t('armorWarrior3Text'),
    notes: t('armorWarrior3Notes', {
      con: 7
    }),
    con: 7,
    value: 65
  },
  4: {
    text: t('armorWarrior4Text'),
    notes: t('armorWarrior4Notes', {
      con: 9
    }),
    con: 9,
    value: 90
  },
  5: {
    text: t('armorWarrior5Text'),
    notes: t('armorWarrior5Notes', {
      con: 11
    }),
    con: 11,
    value: 120,
    last: true
  }
};
