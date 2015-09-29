import {translator as t} from '../helpers';
import events from '../events';

import {eyewear as baseEyewear} from './sets/base';

import {eyewear as mysteryEyewear} from './sets/mystery';

let eyewear = {
  base: baseEyewear,
  special: {
    wondercon_red: {
      text: t('eyewearSpecialWonderconRedText'),
      notes: t('eyewearSpecialWonderconRedNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    wondercon_black: {
      text: t('eyewearSpecialWonderconBlackText'),
      notes: t('eyewearSpecialWonderconBlackNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    summerRogue: {
      event: events.summer,
      specialClass: 'rogue',
      text: t('eyewearSpecialSummerRogueText'),
      notes: t('eyewearSpecialSummerRogueNotes'),
      value: 20
    },
    summerWarrior: {
      event: events.summer,
      specialClass: 'warrior',
      text: t('eyewearSpecialSummerWarriorText'),
      notes: t('eyewearSpecialSummerWarriorNotes'),
      value: 20
    }
  },
  mystery: mysteryEyewear,
  armoire: {
    plagueDoctorMask: {
      text: t('eyewearArmoirePlagueDoctorMaskText'),
      notes: t('eyewearArmoirePlagueDoctorMaskNotes'),
      value: 100,
      set: 'plagueDoctor',
      canOwn: ((u) => {
        return u.items.gear.owned.eyewear_armoire_plagueDoctorMask != null;
      })
    }
  }
};

export default eyewear;
