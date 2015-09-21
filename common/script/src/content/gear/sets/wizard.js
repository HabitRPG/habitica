import {translator as t} from '../../helpers';
import events from '../../events';

export var armor = {
  1: {
    text: t('armorWizard1Text'),
    notes: t('armorWizard1Notes', {
      int: 2
    }),
    int: 2,
    value: 30
  },
  2: {
    text: t('armorWizard2Text'),
    notes: t('armorWizard2Notes', {
      int: 4
    }),
    int: 4,
    value: 45
  },
  3: {
    text: t('armorWizard3Text'),
    notes: t('armorWizard3Notes', {
      int: 6
    }),
    int: 6,
    value: 65
  },
  4: {
    text: t('armorWizard4Text'),
    notes: t('armorWizard4Notes', {
      int: 9
    }),
    int: 9,
    value: 90
  },
  5: {
    text: t('armorWizard5Text'),
    notes: t('armorWizard5Notes', {
      int: 12
    }),
    int: 12,
    value: 120,
    last: true
  }
};
