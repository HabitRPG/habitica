import {translator as t} from '../helpers';
import events from '../events';

import {back as baseBack} from './sets/base';

import {back as mysteryBack} from './sets/mystery';

let back = {
  base: baseBack,
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

