import {translator as t} from '../helpers';
import events from '../events';

let eyewear = {
  base: {
    0: {
      text: t('eyewearBase0Text'),
      notes: t('eyewearBase0Notes'),
      value: 0,
      last: true
    }
  },
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
  mystery: {
    201503: {
      text: t('eyewearMystery201503Text'),
      notes: t('eyewearMystery201503Notes'),
      mystery: '201503',
      value: 0
    },
    201506: {
      text: t('eyewearMystery201506Text'),
      notes: t('eyewearMystery201506Notes'),
      mystery: '201506',
      value: 0
    },
    201507: {
      text: t('eyewearMystery201507Text'),
      notes: t('eyewearMystery201507Notes'),
      mystery: '201507',
      value: 0
    },
    301404: {
      text: t('eyewearMystery301404Text'),
      notes: t('eyewearMystery301404Notes'),
      mystery: '301404',
      value: 0
    },
    301405: {
      text: t('eyewearMystery301405Text'),
      notes: t('eyewearMystery301405Notes'),
      mystery: '301405',
      value: 0
    }
  },
  armoire: {
    plagueDoctorMask: {
      text: t('eyewearArmoirePlagueDoctorMaskText'),
      notes: t('eyewearArmoirePlagueDoctorMaskNotes'),
      set: 'plagueDoctor',
      canOwn: (function(u) {
        return u.items.gear.owned.eyewear_armoire_plagueDoctorMask != null;
      })
    }
  }
};

export default eyewear;
