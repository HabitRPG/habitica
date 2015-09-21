import {translator as t} from '../../helpers';
import events from '../../events';

export var armor = {
  1: {
    text: t('armorHealer1Text'),
    notes: t('armorHealer1Notes', {
      con: 6
    }),
    con: 6,
    value: 30
  },
  2: {
    text: t('armorHealer2Text'),
    notes: t('armorHealer2Notes', {
      con: 9
    }),
    con: 9,
    value: 45
  },
  3: {
    text: t('armorHealer3Text'),
    notes: t('armorHealer3Notes', {
      con: 12
    }),
    con: 12,
    value: 65
  },
  4: {
    text: t('armorHealer4Text'),
    notes: t('armorHealer4Notes', {
      con: 15
    }),
    con: 15,
    value: 90
  },
  5: {
    text: t('armorHealer5Text'),
    notes: t('armorHealer5Notes', {
      con: 18
    }),
    con: 18,
    value: 120,
    last: true
  }
};
