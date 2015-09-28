import {translator as t} from '../helpers';
import events from '../events';

import {base as baseShield} from './sets/base';

import {shield as healerShield} from './sets/healer';
import {shield as rogueShield} from './sets/rogue';
import {shield as warriorShield} from './sets/warrior';
import {shield as wizardShield} from './sets/wizard';

let shield = {
  base: baseShield,

  warrior: warriorShield,
  rogue: rogueShield,
  wizard: wizardShield,
  healer: healerShield,

  special: {
    0: {
      text: t('shieldSpecial0Text'),
      notes: t('shieldSpecial0Notes', {
        per: 20
      }),
      per: 20,
      value: 150,
      canOwn: ((u) => {
        var ref;
        return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
      })
    },
    1: {
      text: t('shieldSpecial1Text'),
      notes: t('shieldSpecial1Notes', {
        attrs: 6
      }),
      con: 6,
      str: 6,
      per: 6,
      int: 6,
      value: 170,
      canOwn: ((u) => {
        var ref;
        return +((ref = u.contributor) != null ? ref.level : void 0) >= 5;
      })
    },
    goldenknight: {
      text: t('shieldSpecialGoldenknightText'),
      notes: t('shieldSpecialGoldenknightNotes', {
        attrs: 25
      }),
      con: 25,
      per: 25,
      value: 200,
      canOwn: ((u) => {
        return u.items.gear.owned.shield_special_goldenknight != null;
      })
    },
    moonpearlShield: {
      text: t('shieldSpecialMoonpearlShieldText'),
      notes: t('shieldSpecialMoonpearlShieldNotes', {
        con: 15
      }),
      con: 15,
      value: 130,
      canOwn: ((u) => {
        return u.items.gear.owned.shield_special_moonpearlShield != null;
      })
    },
    yeti: {
      event: events.winter,
      specialClass: 'warrior',
      text: t('shieldSpecialYetiText'),
      notes: t('shieldSpecialYetiNotes', {
        con: 7
      }),
      con: 7,
      value: 70
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
    snowflake: {
      event: events.winter,
      specialClass: 'healer',
      text: t('shieldSpecialSnowflakeText'),
      notes: t('shieldSpecialSnowflakeNotes', {
        con: 9
      }),
      con: 9,
      value: 70
    },
    springRogue: {
      event: events.spring,
      specialClass: 'rogue',
      text: t('shieldSpecialSpringRogueText'),
      notes: t('shieldSpecialSpringRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    springWarrior: {
      event: events.spring,
      specialClass: 'warrior',
      text: t('shieldSpecialSpringWarriorText'),
      notes: t('shieldSpecialSpringWarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    springHealer: {
      event: events.spring,
      specialClass: 'healer',
      text: t('shieldSpecialSpringHealerText'),
      notes: t('shieldSpecialSpringHealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    summerRogue: {
      event: events.summer,
      specialClass: 'rogue',
      text: t('shieldSpecialSummerRogueText'),
      notes: t('shieldSpecialSummerRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    summerWarrior: {
      event: events.summer,
      specialClass: 'warrior',
      text: t('shieldSpecialSummerWarriorText'),
      notes: t('shieldSpecialSummerWarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    summerHealer: {
      event: events.summer,
      specialClass: 'healer',
      text: t('shieldSpecialSummerHealerText'),
      notes: t('shieldSpecialSummerHealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    fallRogue: {
      event: events.fall,
      specialClass: 'rogue',
      text: t('shieldSpecialFallRogueText'),
      notes: t('shieldSpecialFallRogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    fallWarrior: {
      event: events.fall,
      specialClass: 'warrior',
      text: t('shieldSpecialFallWarriorText'),
      notes: t('shieldSpecialFallWarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    fallHealer: {
      event: events.fall,
      specialClass: 'healer',
      text: t('shieldSpecialFallHealerText'),
      notes: t('shieldSpecialFallHealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    winter2015Rogue: {
      event: events.winter2015,
      specialClass: 'rogue',
      text: t('shieldSpecialWinter2015RogueText'),
      notes: t('shieldSpecialWinter2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    winter2015Warrior: {
      event: events.winter2015,
      specialClass: 'warrior',
      text: t('shieldSpecialWinter2015WarriorText'),
      notes: t('shieldSpecialWinter2015WarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    winter2015Healer: {
      event: events.winter2015,
      specialClass: 'healer',
      text: t('shieldSpecialWinter2015HealerText'),
      notes: t('shieldSpecialWinter2015HealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    spring2015Rogue: {
      event: events.spring2015,
      specialClass: 'rogue',
      text: t('shieldSpecialSpring2015RogueText'),
      notes: t('shieldSpecialSpring2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    spring2015Warrior: {
      event: events.spring2015,
      specialClass: 'warrior',
      text: t('shieldSpecialSpring2015WarriorText'),
      notes: t('shieldSpecialSpring2015WarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    spring2015Healer: {
      event: events.spring2015,
      specialClass: 'healer',
      text: t('shieldSpecialSpring2015HealerText'),
      notes: t('shieldSpecialSpring2015HealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    summer2015Rogue: {
      event: events.summer2015,
      specialClass: 'rogue',
      text: t('shieldSpecialSummer2015RogueText'),
      notes: t('shieldSpecialSummer2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    summer2015Warrior: {
      event: events.summer2015,
      specialClass: 'warrior',
      text: t('shieldSpecialSummer2015WarriorText'),
      notes: t('shieldSpecialSummer2015WarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    summer2015Healer: {
      event: events.summer2015,
      specialClass: 'healer',
      text: t('shieldSpecialSummer2015HealerText'),
      notes: t('shieldSpecialSummer2015HealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    },
    fall2015Rogue: {
      event: events.fall2015,
      specialClass: 'rogue',
      text: t('shieldSpecialFall2015RogueText'),
      notes: t('shieldSpecialFall2015RogueNotes', {
        str: 8
      }),
      value: 80,
      str: 8
    },
    fall2015Warrior: {
      event: events.fall2015,
      specialClass: 'warrior',
      text: t('shieldSpecialFall2015WarriorText'),
      notes: t('shieldSpecialFall2015WarriorNotes', {
        con: 7
      }),
      value: 70,
      con: 7
    },
    fall2015Healer: {
      event: events.fall2015,
      specialClass: 'healer',
      text: t('shieldSpecialFall2015HealerText'),
      notes: t('shieldSpecialFall2015HealerNotes', {
        con: 9
      }),
      value: 70,
      con: 9
    }
  },
  mystery: {
    301405: {
      text: t('shieldMystery301405Text'),
      notes: t('shieldMystery301405Notes'),
      mystery: '301405',
      value: 0
    }
  },
  armoire: {
    gladiatorShield: {
      text: t('shieldArmoireGladiatorShieldText'),
      notes: t('shieldArmoireGladiatorShieldNotes', {
        con: 5,
        str: 5
      }),
      value: 100,
      con: 5,
      str: 5,
      set: 'gladiator',
      canOwn: ((u) => {
        return u.items.gear.owned.shield_armoire_gladiatorShield != null;
      })
    }
  }
};

export default shield;
