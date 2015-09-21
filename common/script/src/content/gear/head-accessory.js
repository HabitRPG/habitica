import t from '../helpers/translator';
import events from '../events';

let headAccessory = {
  base: {
    0: {
      text: t('headAccessoryBase0Text'),
      notes: t('headAccessoryBase0Notes'),
      value: 0,
      last: true
    }
  },
  special: {
    springRogue: {
      event: events.spring,
      specialClass: 'rogue',
      text: t('headAccessorySpecialSpringRogueText'),
      notes: t('headAccessorySpecialSpringRogueNotes'),
      value: 20
    },
    springWarrior: {
      event: events.spring,
      specialClass: 'warrior',
      text: t('headAccessorySpecialSpringWarriorText'),
      notes: t('headAccessorySpecialSpringWarriorNotes'),
      value: 20
    },
    springMage: {
      event: events.spring,
      specialClass: 'wizard',
      text: t('headAccessorySpecialSpringMageText'),
      notes: t('headAccessorySpecialSpringMageNotes'),
      value: 20
    },
    springHealer: {
      event: events.spring,
      specialClass: 'healer',
      text: t('headAccessorySpecialSpringHealerText'),
      notes: t('headAccessorySpecialSpringHealerNotes'),
      value: 20
    },
    spring2015Rogue: {
      event: events.spring2015,
      specialClass: 'rogue',
      text: t('headAccessorySpecialSpring2015RogueText'),
      notes: t('headAccessorySpecialSpring2015RogueNotes'),
      value: 20
    },
    spring2015Warrior: {
      event: events.spring2015,
      specialClass: 'warrior',
      text: t('headAccessorySpecialSpring2015WarriorText'),
      notes: t('headAccessorySpecialSpring2015WarriorNotes'),
      value: 20
    },
    spring2015Mage: {
      event: events.spring2015,
      specialClass: 'wizard',
      text: t('headAccessorySpecialSpring2015MageText'),
      notes: t('headAccessorySpecialSpring2015MageNotes'),
      value: 20
    },
    spring2015Healer: {
      event: events.spring2015,
      specialClass: 'healer',
      text: t('headAccessorySpecialSpring2015HealerText'),
      notes: t('headAccessorySpecialSpring2015HealerNotes'),
      value: 20
    },
    bearEars: {
      gearSet: 'animal',
      text: t('headAccessoryBearEarsText'),
      notes: t('headAccessoryBearEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_bearEars != null;
      })
    },
    cactusEars: {
      gearSet: 'animal',
      text: t('headAccessoryCactusEarsText'),
      notes: t('headAccessoryCactusEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_cactusEars != null;
      })
    },
    foxEars: {
      gearSet: 'animal',
      text: t('headAccessoryFoxEarsText'),
      notes: t('headAccessoryFoxEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_foxEars != null;
      })
    },
    lionEars: {
      gearSet: 'animal',
      text: t('headAccessoryLionEarsText'),
      notes: t('headAccessoryLionEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_lionEars != null;
      })
    },
    pandaEars: {
      gearSet: 'animal',
      text: t('headAccessoryPandaEarsText'),
      notes: t('headAccessoryPandaEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_pandaEars != null;
      })
    },
    pigEars: {
      gearSet: 'animal',
      text: t('headAccessoryPigEarsText'),
      notes: t('headAccessoryPigEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_pigEars != null;
      })
    },
    tigerEars: {
      gearSet: 'animal',
      text: t('headAccessoryTigerEarsText'),
      notes: t('headAccessoryTigerEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_tigerEars != null;
      })
    },
    wolfEars: {
      gearSet: 'animal',
      text: t('headAccessoryWolfEarsText'),
      notes: t('headAccessoryWolfEarsNotes'),
      value: 20,
      canOwn: (function(u) {
        return u.items.gear.owned.headAccessory_special_wolfEars != null;
      })
    }
  },
  mystery: {
    201403: {
      text: t('headAccessoryMystery201403Text'),
      notes: t('headAccessoryMystery201403Notes'),
      mystery: '201403',
      value: 0
    },
    201404: {
      text: t('headAccessoryMystery201404Text'),
      notes: t('headAccessoryMystery201404Notes'),
      mystery: '201404',
      value: 0
    },
    201409: {
      text: t('headAccessoryMystery201409Text'),
      notes: t('headAccessoryMystery201409Notes'),
      mystery: '201409',
      value: 0
    },
    201502: {
      text: t('headAccessoryMystery201502Text'),
      notes: t('headAccessoryMystery201502Notes'),
      mystery: '201502',
      value: 0
    },
    301405: {
      text: t('headAccessoryMystery301405Text'),
      notes: t('headAccessoryMystery301405Notes'),
      mystery: '301405',
      value: 0
    }
  }
};

export default headAccessory;

