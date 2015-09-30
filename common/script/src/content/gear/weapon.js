import {translator as t} from '../helpers';
import events from '../events';

import {base as baseWeapon} from './sets/base';

import {weapon as healerWeapon} from './sets/healer';
import {weapon as rogueWeapon} from './sets/rogue';
import {weapon as warriorWeapon} from './sets/warrior';
import {weapon as wizardWeapon} from './sets/wizard';

import {weapon as armoireWeapon} from './sets/armoire';
import {weapon as mysteryWeapon} from './sets/mystery';

let weapon = {
  base: baseWeapon,

  warrior: warriorWeapon,
  rogue: rogueWeapon,
  wizard: wizardWeapon,
  healer: healerWeapon,

  special: {
    0: {
      text: t('weaponSpecial0Text'),
      notes: t('weaponSpecial0Notes', {
        str: 20
      }),
      str: 20,
      value: 150,
      canOwn: (function(u) {
        var ref;
        return +((ref = u.backer) != null ? ref.tier : void 0) >= 70;
      })
    },
    1: {
      text: t('weaponSpecial1Text'),
      notes: t('weaponSpecial1Notes', {
        attrs: 6
      }),
      str: 6,
      per: 6,
      con: 6,
      int: 6,
      value: 170,
      canOwn: (function(u) {
        var ref;
        return +((ref = u.contributor) != null ? ref.level : void 0) >= 4;
      })
    },
    2: {
      text: t('weaponSpecial2Text'),
      notes: t('weaponSpecial2Notes', {
        attrs: 25
      }),
      str: 25,
      per: 25,
      value: 200,
      canOwn: (function(u) {
        var ref;
        return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_2 != null);
      })
    },
    3: {
      text: t('weaponSpecial3Text'),
      notes: t('weaponSpecial3Notes', {
        attrs: 17
      }),
      str: 17,
      int: 17,
      con: 17,
      value: 200,
      canOwn: (function(u) {
        var ref;
        return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.weapon_special_3 != null);
      })
    },
    critical: {
      text: t('weaponSpecialCriticalText'),
      notes: t('weaponSpecialCriticalNotes', {
        attrs: 40
      }),
      str: 40,
      per: 40,
      value: 200,
      canOwn: (function(u) {
        var ref;
        return !!((ref = u.contributor) != null ? ref.critical : void 0);
      })
    },
    tridentOfCrashingTides: {
      text: t('weaponSpecialTridentOfCrashingTidesText'),
      notes: t('weaponSpecialTridentOfCrashingTidesNotes', {
        int: 15
      }),
      int: 15,
      value: 130,
      canOwn: (function(u) {
        return u.items.gear.owned.weapon_special_tridentOfCrashingTides != null;
      })
    },
    yeti: {
      event: events.winter,
      specialClass: 'warrior',
      text: t('weaponSpecialYetiText'),
      notes: t('weaponSpecialYetiNotes', {
        str: 15
      }),
      str: 15,
      value: 90
    },
    ski: {
      event: events.winter,
      specialClass: 'rogue',
      text: t('weaponSpecialSkiText'),
      notes: t('weaponSpecialSkiNotes', {
        str: 8
      }),
      str: 8,
      value: 90
    },
    candycane: {
      event: events.winter,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialCandycaneText'),
      notes: t('weaponSpecialCandycaneNotes', {
        int: 15,
        per: 7
      }),
      int: 15,
      per: 7,
      value: 160
    },
    snowflake: {
      event: events.winter,
      specialClass: 'healer',
      text: t('weaponSpecialSnowflakeText'),
      notes: t('weaponSpecialSnowflakeNotes', {
        int: 9
      }),
      int: 9,
      value: 90
    },
    springRogue: {
      event: events.spring,
      specialClass: 'rogue',
      text: t('weaponSpecialSpringRogueText'),
      notes: t('weaponSpecialSpringRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    springWarrior: {
      event: events.spring,
      specialClass: 'warrior',
      text: t('weaponSpecialSpringWarriorText'),
      notes: t('weaponSpecialSpringWarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    springMage: {
      event: events.spring,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialSpringMageText'),
      notes: t('weaponSpecialSpringMageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    springHealer: {
      event: events.spring,
      specialClass: 'healer',
      text: t('weaponSpecialSpringHealerText'),
      notes: t('weaponSpecialSpringHealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    summerRogue: {
      event: events.summer,
      specialClass: 'rogue',
      text: t('weaponSpecialSummerRogueText'),
      notes: t('weaponSpecialSummerRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    summerWarrior: {
      event: events.summer,
      specialClass: 'warrior',
      text: t('weaponSpecialSummerWarriorText'),
      notes: t('weaponSpecialSummerWarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    summerMage: {
      event: events.summer,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialSummerMageText'),
      notes: t('weaponSpecialSummerMageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    summerHealer: {
      event: events.summer,
      specialClass: 'healer',
      text: t('weaponSpecialSummerHealerText'),
      notes: t('weaponSpecialSummerHealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    fallRogue: {
      event: events.fall,
      specialClass: 'rogue',
      text: t('weaponSpecialFallRogueText'),
      notes: t('weaponSpecialFallRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    fallWarrior: {
      event: events.fall,
      specialClass: 'warrior',
      text: t('weaponSpecialFallWarriorText'),
      notes: t('weaponSpecialFallWarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    fallMage: {
      event: events.fall,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialFallMageText'),
      notes: t('weaponSpecialFallMageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    fallHealer: {
      event: events.fall,
      specialClass: 'healer',
      text: t('weaponSpecialFallHealerText'),
      notes: t('weaponSpecialFallHealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    winter2015Rogue: {
      event: events.winter2015,
      specialClass: 'rogue',
      text: t('weaponSpecialWinter2015RogueText'),
      notes: t('weaponSpecialWinter2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    winter2015Warrior: {
      event: events.winter2015,
      specialClass: 'warrior',
      text: t('weaponSpecialWinter2015WarriorText'),
      notes: t('weaponSpecialWinter2015WarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    winter2015Mage: {
      event: events.winter2015,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialWinter2015MageText'),
      notes: t('weaponSpecialWinter2015MageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    winter2015Healer: {
      event: events.winter2015,
      specialClass: 'healer',
      text: t('weaponSpecialWinter2015HealerText'),
      notes: t('weaponSpecialWinter2015HealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    spring2015Rogue: {
      event: events.spring2015,
      specialClass: 'rogue',
      text: t('weaponSpecialSpring2015RogueText'),
      notes: t('weaponSpecialSpring2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    spring2015Warrior: {
      event: events.spring2015,
      specialClass: 'warrior',
      text: t('weaponSpecialSpring2015WarriorText'),
      notes: t('weaponSpecialSpring2015WarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    spring2015Mage: {
      event: events.spring2015,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialSpring2015MageText'),
      notes: t('weaponSpecialSpring2015MageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    spring2015Healer: {
      event: events.spring2015,
      specialClass: 'healer',
      text: t('weaponSpecialSpring2015HealerText'),
      notes: t('weaponSpecialSpring2015HealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    summer2015Rogue: {
      event: events.summer2015,
      specialClass: 'rogue',
      text: t('weaponSpecialSummer2015RogueText'),
      notes: t('weaponSpecialSummer2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    summer2015Warrior: {
      event: events.summer2015,
      specialClass: 'warrior',
      text: t('weaponSpecialSummer2015WarriorText'),
      notes: t('weaponSpecialSummer2015WarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    summer2015Mage: {
      event: events.summer2015,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialSummer2015MageText'),
      notes: t('weaponSpecialSummer2015MageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    summer2015Healer: {
      event: events.summer2015,
      specialClass: 'healer',
      text: t('weaponSpecialSummer2015HealerText'),
      notes: t('weaponSpecialSummer2015HealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    },
    fall2015Rogue: {
      event: events.fall2015,
      specialClass: 'rogue',
      text: t('weaponSpecialFall2015RogueText'),
      notes: t('weaponSpecialFall2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    fall2015Warrior: {
      event: events.fall2015,
      specialClass: 'warrior',
      text: t('weaponSpecialFall2015WarriorText'),
      notes: t('weaponSpecialFall2015WarriorNotes', {
        str: 15
      }),
      value: 90,
      str: 15
    },
    fall2015Mage: {
      event: events.fall2015,
      specialClass: 'wizard',
      twoHanded: true,
      text: t('weaponSpecialFall2015MageText'),
      notes: t('weaponSpecialFall2015MageNotes', {
        int: 15,
        per: 7
      }),
      value: 160,
      int: 15,
      per: 7
    },
    fall2015Healer: {
      event: events.fall2015,
      specialClass: 'healer',
      text: t('weaponSpecialFall2015HealerText'),
      notes: t('weaponSpecialFall2015HealerNotes', {
        int: 9
      }),
      value: 90,
      int: 9
    }
  },
  mystery: mysteryWeapon,
  armoire: armoireWeapon,
};

export default weapon;
