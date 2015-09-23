import {translator as t} from '../../helpers';
import events from '../../events';

export var armor = {
  0: {
    text: t('armorSpecial0Text'),
    notes: t('armorSpecial0Notes', {
      con: 20
    }),
    con: 20,
    value: 150,
    canOwn: (function(u) {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
    })
  },
  1: {
    text: t('armorSpecial1Text'),
    notes: t('armorSpecial1Notes', {
      attrs: 6
    }),
    con: 6,
    str: 6,
    per: 6,
    int: 6,
    value: 170,
    canOwn: (function(u) {
      var ref;
      return +((ref = u.contributor) != null ? ref.level : void 0) >= 2;
    })
  },
  2: {
    text: t('armorSpecial2Text'),
    notes: t('armorSpecial2Notes', {
      attrs: 25
    }),
    int: 25,
    con: 25,
    value: 200,
    canOwn: (function(u) {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 300 || (u.items.gear.owned.armor_special_2 != null);
    })
  },
  finnedOceanicArmor: {
    text: t('armorSpecialFinnedOceanicArmorText'),
    notes: t('armorSpecialFinnedOceanicArmorNotes', {
      str: 15
    }),
    str: 15,
    value: 130,
    canOwn: (function(u) {
      return u.items.gear.owned.armor_special_finnedOceanicArmor != null;
    })
  },
  yeti: {
    event: events.winter,
    specialClass: 'warrior',
    text: t('armorSpecialYetiText'),
    notes: t('armorSpecialYetiNotes', {
      con: 9
    }),
    con: 9,
    value: 90
  },
  ski: {
    event: events.winter,
    specialClass: 'rogue',
    text: t('armorSpecialSkiText'),
    notes: t('armorSpecialSkiNotes', {
      per: 15
    }),
    per: 15,
    value: 90
  },
  candycane: {
    event: events.winter,
    specialClass: 'wizard',
    text: t('armorSpecialCandycaneText'),
    notes: t('armorSpecialCandycaneNotes', {
      int: 9
    }),
    int: 9,
    value: 90
  },
  snowflake: {
    event: events.winter,
    specialClass: 'healer',
    text: t('armorSpecialSnowflakeText'),
    notes: t('armorSpecialSnowflakeNotes', {
      con: 15
    }),
    con: 15,
    value: 90
  },
  birthday: {
    event: events.birthday,
    text: t('armorSpecialBirthdayText'),
    notes: t('armorSpecialBirthdayNotes'),
    value: 0
  },
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    text: t('armorSpecialSpringRogueText'),
    notes: t('armorSpecialSpringRogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    text: t('armorSpecialSpringWarriorText'),
    notes: t('armorSpecialSpringWarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  springMage: {
    event: events.spring,
    specialClass: 'wizard',
    text: t('armorSpecialSpringMageText'),
    notes: t('armorSpecialSpringMageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    text: t('armorSpecialSpringHealerText'),
    notes: t('armorSpecialSpringHealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    text: t('armorSpecialSummerRogueText'),
    notes: t('armorSpecialSummerRogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    text: t('armorSpecialSummerWarriorText'),
    notes: t('armorSpecialSummerWarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  summerMage: {
    event: events.summer,
    specialClass: 'wizard',
    text: t('armorSpecialSummerMageText'),
    notes: t('armorSpecialSummerMageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    text: t('armorSpecialSummerHealerText'),
    notes: t('armorSpecialSummerHealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  fallRogue: {
    event: events.fall,
    specialClass: 'rogue',
    text: t('armorSpecialFallRogueText'),
    notes: t('armorSpecialFallRogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  fallWarrior: {
    event: events.fall,
    specialClass: 'warrior',
    text: t('armorSpecialFallWarriorText'),
    notes: t('armorSpecialFallWarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  fallMage: {
    event: events.fall,
    specialClass: 'wizard',
    text: t('armorSpecialFallMageText'),
    notes: t('armorSpecialFallMageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  fallHealer: {
    event: events.fall,
    specialClass: 'healer',
    text: t('armorSpecialFallHealerText'),
    notes: t('armorSpecialFallHealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  winter2015Rogue: {
    event: events.winter2015,
    specialClass: 'rogue',
    text: t('armorSpecialWinter2015RogueText'),
    notes: t('armorSpecialWinter2015RogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  winter2015Warrior: {
    event: events.winter2015,
    specialClass: 'warrior',
    text: t('armorSpecialWinter2015WarriorText'),
    notes: t('armorSpecialWinter2015WarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  winter2015Mage: {
    event: events.winter2015,
    specialClass: 'wizard',
    text: t('armorSpecialWinter2015MageText'),
    notes: t('armorSpecialWinter2015MageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  winter2015Healer: {
    event: events.winter2015,
    specialClass: 'healer',
    text: t('armorSpecialWinter2015HealerText'),
    notes: t('armorSpecialWinter2015HealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  birthday2015: {
    text: t('armorSpecialBirthday2015Text'),
    notes: t('armorSpecialBirthday2015Notes'),
    value: 0,
    canOwn: (function(u) {
      return u.items.gear.owned.armor_special_birthday2015 != null;
    })
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    text: t('armorSpecialSpring2015RogueText'),
    notes: t('armorSpecialSpring2015RogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    text: t('armorSpecialSpring2015WarriorText'),
    notes: t('armorSpecialSpring2015WarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  spring2015Mage: {
    event: events.spring2015,
    specialClass: 'wizard',
    text: t('armorSpecialSpring2015MageText'),
    notes: t('armorSpecialSpring2015MageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    text: t('armorSpecialSpring2015HealerText'),
    notes: t('armorSpecialSpring2015HealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    text: t('armorSpecialSummer2015RogueText'),
    notes: t('armorSpecialSummer2015RogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    text: t('armorSpecialSummer2015WarriorText'),
    notes: t('armorSpecialSummer2015WarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  summer2015Mage: {
    event: events.summer2015,
    specialClass: 'wizard',
    text: t('armorSpecialSummer2015MageText'),
    notes: t('armorSpecialSummer2015MageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    text: t('armorSpecialSummer2015HealerText'),
    notes: t('armorSpecialSummer2015HealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  fall2015Rogue: {
    event: events.fall2015,
    specialClass: 'rogue',
    text: t('armorSpecialFall2015RogueText'),
    notes: t('armorSpecialFall2015RogueNotes', {
      per: 15
    }),
    value: 90,
    per: 15
  },
  fall2015Warrior: {
    event: events.fall2015,
    specialClass: 'warrior',
    text: t('armorSpecialFall2015WarriorText'),
    notes: t('armorSpecialFall2015WarriorNotes', {
      con: 9
    }),
    value: 90,
    con: 9
  },
  fall2015Mage: {
    event: events.fall2015,
    specialClass: 'wizard',
    text: t('armorSpecialFall2015MageText'),
    notes: t('armorSpecialFall2015MageNotes', {
      int: 9
    }),
    value: 90,
    int: 9
  },
  fall2015Healer: {
    event: events.fall2015,
    specialClass: 'healer',
    text: t('armorSpecialFall2015HealerText'),
    notes: t('armorSpecialFall2015HealerNotes', {
      con: 15
    }),
    value: 90,
    con: 15
  },
  gaymerx: {
    event: events.gaymerx,
    text: t('armorSpecialGaymerxText'),
    notes: t('armorSpecialGaymerxNotes'),
    value: 0
  }
};
