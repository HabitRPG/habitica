import {translator as t} from '../../helpers';
import events from '../../events';

export var armor = {
  1: {
    text: t('armorRogue1Text'),
    notes: t('armorRogue1Notes', {
      per: 6
    }),
    per: 6,
    value: 30
  },
  2: {
    text: t('armorRogue2Text'),
    notes: t('armorRogue2Notes', {
      per: 9
    }),
    per: 9,
    value: 45
  },
  3: {
    text: t('armorRogue3Text'),
    notes: t('armorRogue3Notes', {
      per: 12
    }),
    per: 12,
    value: 65
  },
  4: {
    text: t('armorRogue4Text'),
    notes: t('armorRogue4Notes', {
      per: 15
    }),
    per: 15,
    value: 90
  },
  5: {
    text: t('armorRogue5Text'),
    notes: t('armorRogue5Notes', {
      per: 18
    }),
    per: 18,
    value: 120,
    last: true
  }
};
