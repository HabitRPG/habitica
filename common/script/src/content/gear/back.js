import {translator as t} from '../helpers';
import events from '../events';

import {back as mysteryBack} from './sets/mystery';

let back = {
  base: {
    0: {
      text: t('backBase0Text'),
      notes: t('backBase0Notes'),
      value: 0
    }
  },
  mystery: mysteryBack,
  special: {
    wondercon_red: {
      text: t('backSpecialWonderconRedText'),
      notes: t('backSpecialWonderconRedNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    wondercon_black: {
      text: t('backSpecialWonderconBlackText'),
      notes: t('backSpecialWonderconBlackNotes'),
      value: 0,
      mystery: 'wondercon'
    }
  }
};

export default back;

