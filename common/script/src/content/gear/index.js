import t from '../helpers/translator';
import events from '../events';

let gear = {
  weapon: {
    base: {
      0: {
        text: t('weaponBase0Text'),
        notes: t('weaponBase0Notes'),
        value: 0
      }
    },
    warrior: {
      0: {
        text: t('weaponWarrior0Text'),
        notes: t('weaponWarrior0Notes'),
        value: 1
      },
      1: {
        text: t('weaponWarrior1Text'),
        notes: t('weaponWarrior1Notes', {
          str: 3
        }),
        str: 3,
        value: 20
      },
      2: {
        text: t('weaponWarrior2Text'),
        notes: t('weaponWarrior2Notes', {
          str: 6
        }),
        str: 6,
        value: 30
      },
      3: {
        text: t('weaponWarrior3Text'),
        notes: t('weaponWarrior3Notes', {
          str: 9
        }),
        str: 9,
        value: 45
      },
      4: {
        text: t('weaponWarrior4Text'),
        notes: t('weaponWarrior4Notes', {
          str: 12
        }),
        str: 12,
        value: 65
      },
      5: {
        text: t('weaponWarrior5Text'),
        notes: t('weaponWarrior5Notes', {
          str: 15
        }),
        str: 15,
        value: 90
      },
      6: {
        text: t('weaponWarrior6Text'),
        notes: t('weaponWarrior6Notes', {
          str: 18
        }),
        str: 18,
        value: 120,
        last: true
      }
    },
    rogue: {
      0: {
        text: t('weaponRogue0Text'),
        notes: t('weaponRogue0Notes'),
        str: 0,
        value: 0
      },
      1: {
        text: t('weaponRogue1Text'),
        notes: t('weaponRogue1Notes', {
          str: 2
        }),
        str: 2,
        value: 20
      },
      2: {
        text: t('weaponRogue2Text'),
        notes: t('weaponRogue2Notes', {
          str: 3
        }),
        str: 3,
        value: 35
      },
      3: {
        text: t('weaponRogue3Text'),
        notes: t('weaponRogue3Notes', {
          str: 4
        }),
        str: 4,
        value: 50
      },
      4: {
        text: t('weaponRogue4Text'),
        notes: t('weaponRogue4Notes', {
          str: 6
        }),
        str: 6,
        value: 70
      },
      5: {
        text: t('weaponRogue5Text'),
        notes: t('weaponRogue5Notes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      6: {
        text: t('weaponRogue6Text'),
        notes: t('weaponRogue6Notes', {
          str: 10
        }),
        str: 10,
        value: 120,
        last: true
      }
    },
    wizard: {
      0: {
        twoHanded: true,
        text: t('weaponWizard0Text'),
        notes: t('weaponWizard0Notes'),
        value: 0
      },
      1: {
        twoHanded: true,
        text: t('weaponWizard1Text'),
        notes: t('weaponWizard1Notes', {
          int: 3,
          per: 1
        }),
        int: 3,
        per: 1,
        value: 30
      },
      2: {
        twoHanded: true,
        text: t('weaponWizard2Text'),
        notes: t('weaponWizard2Notes', {
          int: 6,
          per: 2
        }),
        int: 6,
        per: 2,
        value: 50
      },
      3: {
        twoHanded: true,
        text: t('weaponWizard3Text'),
        notes: t('weaponWizard3Notes', {
          int: 9,
          per: 3
        }),
        int: 9,
        per: 3,
        value: 80
      },
      4: {
        twoHanded: true,
        text: t('weaponWizard4Text'),
        notes: t('weaponWizard4Notes', {
          int: 12,
          per: 5
        }),
        int: 12,
        per: 5,
        value: 120
      },
      5: {
        twoHanded: true,
        text: t('weaponWizard5Text'),
        notes: t('weaponWizard5Notes', {
          int: 15,
          per: 7
        }),
        int: 15,
        per: 7,
        value: 160
      },
      6: {
        twoHanded: true,
        text: t('weaponWizard6Text'),
        notes: t('weaponWizard6Notes', {
          int: 18,
          per: 10
        }),
        int: 18,
        per: 10,
        value: 200,
        last: true
      }
    },
    healer: {
      0: {
        text: t('weaponHealer0Text'),
        notes: t('weaponHealer0Notes'),
        value: 0
      },
      1: {
        text: t('weaponHealer1Text'),
        notes: t('weaponHealer1Notes', {
          int: 2
        }),
        int: 2,
        value: 20
      },
      2: {
        text: t('weaponHealer2Text'),
        notes: t('weaponHealer2Notes', {
          int: 3
        }),
        int: 3,
        value: 30
      },
      3: {
        text: t('weaponHealer3Text'),
        notes: t('weaponHealer3Notes', {
          int: 5
        }),
        int: 5,
        value: 45
      },
      4: {
        text: t('weaponHealer4Text'),
        notes: t('weaponHealer4Notes', {
          int: 7
        }),
        int: 7,
        value: 65
      },
      5: {
        text: t('weaponHealer5Text'),
        notes: t('weaponHealer5Notes', {
          int: 9
        }),
        int: 9,
        value: 90
      },
      6: {
        text: t('weaponHealer6Text'),
        notes: t('weaponHealer6Notes', {
          int: 11
        }),
        int: 11,
        value: 120,
        last: true
      }
    },
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
      }
    },
    mystery: {
      201411: {
        text: t('weaponMystery201411Text'),
        notes: t('weaponMystery201411Notes'),
        mystery: '201411',
        value: 0
      },
      201502: {
        text: t('weaponMystery201502Text'),
        notes: t('weaponMystery201502Notes'),
        mystery: '201502',
        value: 0
      },
      201505: {
        text: t('weaponMystery201505Text'),
        notes: t('weaponMystery201505Notes'),
        mystery: '201505',
        value: 0
      },
      301404: {
        text: t('weaponMystery301404Text'),
        notes: t('weaponMystery301404Notes'),
        mystery: '301404',
        value: 0
      }
    },
    armoire: {
      basicCrossbow: {
        text: t('weaponArmoireBasicCrossbowText'),
        notes: t('weaponArmoireBasicCrossbowNotes', {
          str: 5,
          per: 5,
          con: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_basicCrossbow != null;
        })
      },
      lunarSceptre: {
        text: t('weaponArmoireLunarSceptreText'),
        notes: t('weaponArmoireLunarSceptreNotes', {
          con: 7,
          int: 7
        }),
        value: 100,
        con: 7,
        int: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_lunarSceptre != null;
        })
      },
      rancherLasso: {
        twoHanded: true,
        text: t('weaponArmoireRancherLassoText'),
        notes: t('weaponArmoireRancherLassoNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_rancherLasso != null;
        })
      },
      mythmakerSword: {
        text: t('weaponArmoireMythmakerSwordText'),
        notes: t('weaponArmoireMythmakerSwordNotes', {
          attrs: 6
        }),
        value: 100,
        str: 6,
        per: 6,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_mythmakerSword != null;
        })
      },
      ironCrook: {
        text: t('weaponArmoireIronCrookText'),
        notes: t('weaponArmoireIronCrookNotes', {
          attrs: 7
        }),
        value: 100,
        str: 7,
        per: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_ironCrook != null;
        })
      },
      goldWingStaff: {
        text: t('weaponArmoireGoldWingStaffText'),
        notes: t('weaponArmoireGoldWingStaffNotes', {
          attrs: 4
        }),
        value: 100,
        con: 4,
        int: 4,
        per: 4,
        str: 4,
        canOwn: (function(u) {
          return u.items.gear.owned.weapon_armoire_goldWingStaff != null;
        })
      }
    }
  },
  armor: {
    base: {
      0: {
        text: t('armorBase0Text'),
        notes: t('armorBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('armorWarrior1Text'),
        notes: t('armorWarrior1Notes', {
          con: 3
        }),
        con: 3,
        value: 30
      },
      2: {
        text: t('armorWarrior2Text'),
        notes: t('armorWarrior2Notes', {
          con: 5
        }),
        con: 5,
        value: 45
      },
      3: {
        text: t('armorWarrior3Text'),
        notes: t('armorWarrior3Notes', {
          con: 7
        }),
        con: 7,
        value: 65
      },
      4: {
        text: t('armorWarrior4Text'),
        notes: t('armorWarrior4Notes', {
          con: 9
        }),
        con: 9,
        value: 90
      },
      5: {
        text: t('armorWarrior5Text'),
        notes: t('armorWarrior5Notes', {
          con: 11
        }),
        con: 11,
        value: 120,
        last: true
      }
    },
    rogue: {
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
    },
    wizard: {
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
    },
    healer: {
      1: {
        text: t('armorHealer1Text'),
        notes: t('armorHealer1Notes', {
          con: 6
        }),
        con: 6,
        value: 30
      },
      2: {
        text: t('armorHealer2Text'),
        notes: t('armorHealer2Notes', {
          con: 9
        }),
        con: 9,
        value: 45
      },
      3: {
        text: t('armorHealer3Text'),
        notes: t('armorHealer3Notes', {
          con: 12
        }),
        con: 12,
        value: 65
      },
      4: {
        text: t('armorHealer4Text'),
        notes: t('armorHealer4Notes', {
          con: 15
        }),
        con: 15,
        value: 90
      },
      5: {
        text: t('armorHealer5Text'),
        notes: t('armorHealer5Notes', {
          con: 18
        }),
        con: 18,
        value: 120,
        last: true
      }
    },
    special: {
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
      gaymerx: {
        event: events.gaymerx,
        text: t('armorSpecialGaymerxText'),
        notes: t('armorSpecialGaymerxNotes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('armorMystery201402Text'),
        notes: t('armorMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201403: {
        text: t('armorMystery201403Text'),
        notes: t('armorMystery201403Notes'),
        mystery: '201403',
        value: 0
      },
      201405: {
        text: t('armorMystery201405Text'),
        notes: t('armorMystery201405Notes'),
        mystery: '201405',
        value: 0
      },
      201406: {
        text: t('armorMystery201406Text'),
        notes: t('armorMystery201406Notes'),
        mystery: '201406',
        value: 0
      },
      201407: {
        text: t('armorMystery201407Text'),
        notes: t('armorMystery201407Notes'),
        mystery: '201407',
        value: 0
      },
      201408: {
        text: t('armorMystery201408Text'),
        notes: t('armorMystery201408Notes'),
        mystery: '201408',
        value: 0
      },
      201409: {
        text: t('armorMystery201409Text'),
        notes: t('armorMystery201409Notes'),
        mystery: '201409',
        value: 0
      },
      201410: {
        text: t('armorMystery201410Text'),
        notes: t('armorMystery201410Notes'),
        mystery: '201410',
        value: 0
      },
      201412: {
        text: t('armorMystery201412Text'),
        notes: t('armorMystery201412Notes'),
        mystery: '201412',
        value: 0
      },
      201501: {
        text: t('armorMystery201501Text'),
        notes: t('armorMystery201501Notes'),
        mystery: '201501',
        value: 0
      },
      201503: {
        text: t('armorMystery201503Text'),
        notes: t('armorMystery201503Notes'),
        mystery: '201503',
        value: 0
      },
      201504: {
        text: t('armorMystery201504Text'),
        notes: t('armorMystery201504Notes'),
        mystery: '201504',
        value: 0
      },
      201506: {
        text: t('armorMystery201506Text'),
        notes: t('armorMystery201506Notes'),
        mystery: '201506',
        value: 0
      },
      201508: {
        text: t('armorMystery201508Text'),
        notes: t('armorMystery201508Notes'),
        mystery: '201508',
        value: 0,
        int: 0
      },
      301404: {
        text: t('armorMystery301404Text'),
        notes: t('armorMystery301404Notes'),
        mystery: '301404',
        value: 0
      }
    },
    armoire: {
      lunarArmor: {
        text: t('armorArmoireLunarArmorText'),
        notes: t('armorArmoireLunarArmorNotes', {
          str: 7,
          int: 7
        }),
        value: 100,
        str: 7,
        int: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_lunarArmor != null;
        })
      },
      gladiatorArmor: {
        text: t('armorArmoireGladiatorArmorText'),
        notes: t('armorArmoireGladiatorArmorNotes', {
          str: 7,
          per: 7
        }),
        value: 100,
        str: 7,
        per: 7,
        set: 'gladiator',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_gladiatorArmor != null;
        })
      },
      rancherRobes: {
        text: t('armorArmoireRancherRobesText'),
        notes: t('armorArmoireRancherRobesNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_rancherRobes != null;
        })
      },
      goldenToga: {
        text: t('armorArmoireGoldenTogaText'),
        notes: t('armorArmoireGoldenTogaNotes', {
          attrs: 8
        }),
        value: 100,
        str: 8,
        con: 8,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_goldenToga != null;
        })
      },
      hornedIronArmor: {
        text: t('armorArmoireHornedIronArmorText'),
        notes: t('armorArmoireHornedIronArmorNotes', {
          con: 9,
          per: 7
        }),
        value: 100,
        con: 9,
        per: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_hornedIronArmor != null;
        })
      },
      plagueDoctorOvercoat: {
        text: t('armorArmoirePlagueDoctorOvercoatText'),
        notes: t('armorArmoirePlagueDoctorOvercoatNotes', {
          int: 6,
          str: 5,
          con: 6
        }),
        int: 6,
        str: 5,
        con: 6,
        set: 'plagueDoctor',
        canOwn: (function(u) {
          return u.items.gear.owned.armor_armoire_plagueDoctorOvercoat != null;
        })
      }
    }
  },
  head: {
    base: {
      0: {
        text: t('headBase0Text'),
        notes: t('headBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('headWarrior1Text'),
        notes: t('headWarrior1Notes', {
          str: 2
        }),
        str: 2,
        value: 15
      },
      2: {
        text: t('headWarrior2Text'),
        notes: t('headWarrior2Notes', {
          str: 4
        }),
        str: 4,
        value: 25
      },
      3: {
        text: t('headWarrior3Text'),
        notes: t('headWarrior3Notes', {
          str: 6
        }),
        str: 6,
        value: 40
      },
      4: {
        text: t('headWarrior4Text'),
        notes: t('headWarrior4Notes', {
          str: 9
        }),
        str: 9,
        value: 60
      },
      5: {
        text: t('headWarrior5Text'),
        notes: t('headWarrior5Notes', {
          str: 12
        }),
        str: 12,
        value: 80,
        last: true
      }
    },
    rogue: {
      1: {
        text: t('headRogue1Text'),
        notes: t('headRogue1Notes', {
          per: 2
        }),
        per: 2,
        value: 15
      },
      2: {
        text: t('headRogue2Text'),
        notes: t('headRogue2Notes', {
          per: 4
        }),
        per: 4,
        value: 25
      },
      3: {
        text: t('headRogue3Text'),
        notes: t('headRogue3Notes', {
          per: 6
        }),
        per: 6,
        value: 40
      },
      4: {
        text: t('headRogue4Text'),
        notes: t('headRogue4Notes', {
          per: 9
        }),
        per: 9,
        value: 60
      },
      5: {
        text: t('headRogue5Text'),
        notes: t('headRogue5Notes', {
          per: 12
        }),
        per: 12,
        value: 80,
        last: true
      }
    },
    wizard: {
      1: {
        text: t('headWizard1Text'),
        notes: t('headWizard1Notes', {
          per: 2
        }),
        per: 2,
        value: 15
      },
      2: {
        text: t('headWizard2Text'),
        notes: t('headWizard2Notes', {
          per: 3
        }),
        per: 3,
        value: 25
      },
      3: {
        text: t('headWizard3Text'),
        notes: t('headWizard3Notes', {
          per: 5
        }),
        per: 5,
        value: 40
      },
      4: {
        text: t('headWizard4Text'),
        notes: t('headWizard4Notes', {
          per: 7
        }),
        per: 7,
        value: 60
      },
      5: {
        text: t('headWizard5Text'),
        notes: t('headWizard5Notes', {
          per: 10
        }),
        per: 10,
        value: 80,
        last: true
      }
    },
    healer: {
      1: {
        text: t('headHealer1Text'),
        notes: t('headHealer1Notes', {
          int: 2
        }),
        int: 2,
        value: 15
      },
      2: {
        text: t('headHealer2Text'),
        notes: t('headHealer2Notes', {
          int: 3
        }),
        int: 3,
        value: 25
      },
      3: {
        text: t('headHealer3Text'),
        notes: t('headHealer3Notes', {
          int: 5
        }),
        int: 5,
        value: 40
      },
      4: {
        text: t('headHealer4Text'),
        notes: t('headHealer4Notes', {
          int: 7
        }),
        int: 7,
        value: 60
      },
      5: {
        text: t('headHealer5Text'),
        notes: t('headHealer5Notes', {
          int: 9
        }),
        int: 9,
        value: 80,
        last: true
      }
    },
    special: {
      0: {
        text: t('headSpecial0Text'),
        notes: t('headSpecial0Notes', {
          int: 20
        }),
        int: 20,
        value: 150,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
        })
      },
      1: {
        text: t('headSpecial1Text'),
        notes: t('headSpecial1Notes', {
          attrs: 6
        }),
        con: 6,
        str: 6,
        per: 6,
        int: 6,
        value: 170,
        canOwn: (function(u) {
          var ref;
          return +((ref = u.contributor) != null ? ref.level : void 0) >= 3;
        })
      },
      2: {
        text: t('headSpecial2Text'),
        notes: t('headSpecial2Notes', {
          attrs: 25
        }),
        int: 25,
        str: 25,
        value: 200,
        canOwn: (function(u) {
          var ref;
          return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.head_special_2 != null);
        })
      },
      fireCoralCirclet: {
        text: t('headSpecialFireCoralCircletText'),
        notes: t('headSpecialFireCoralCircletNotes', {
          per: 15
        }),
        per: 15,
        value: 130,
        canOwn: (function(u) {
          return u.items.gear.owned.head_special_fireCoralCirclet != null;
        })
      },
      nye: {
        event: events.winter,
        text: t('headSpecialNyeText'),
        notes: t('headSpecialNyeNotes'),
        value: 0
      },
      yeti: {
        event: events.winter,
        specialClass: 'warrior',
        text: t('headSpecialYetiText'),
        notes: t('headSpecialYetiNotes', {
          str: 9
        }),
        str: 9,
        value: 60
      },
      ski: {
        event: events.winter,
        specialClass: 'rogue',
        text: t('headSpecialSkiText'),
        notes: t('headSpecialSkiNotes', {
          per: 9
        }),
        per: 9,
        value: 60
      },
      candycane: {
        event: events.winter,
        specialClass: 'wizard',
        text: t('headSpecialCandycaneText'),
        notes: t('headSpecialCandycaneNotes', {
          per: 7
        }),
        per: 7,
        value: 60
      },
      snowflake: {
        event: events.winter,
        specialClass: 'healer',
        text: t('headSpecialSnowflakeText'),
        notes: t('headSpecialSnowflakeNotes', {
          int: 7
        }),
        int: 7,
        value: 60
      },
      springRogue: {
        event: events.spring,
        specialClass: 'rogue',
        text: t('headSpecialSpringRogueText'),
        notes: t('headSpecialSpringRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      springWarrior: {
        event: events.spring,
        specialClass: 'warrior',
        text: t('headSpecialSpringWarriorText'),
        notes: t('headSpecialSpringWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      springMage: {
        event: events.spring,
        specialClass: 'wizard',
        text: t('headSpecialSpringMageText'),
        notes: t('headSpecialSpringMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      springHealer: {
        event: events.spring,
        specialClass: 'healer',
        text: t('headSpecialSpringHealerText'),
        notes: t('headSpecialSpringHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      summerRogue: {
        event: events.summer,
        specialClass: 'rogue',
        text: t('headSpecialSummerRogueText'),
        notes: t('headSpecialSummerRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      summerWarrior: {
        event: events.summer,
        specialClass: 'warrior',
        text: t('headSpecialSummerWarriorText'),
        notes: t('headSpecialSummerWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      summerMage: {
        event: events.summer,
        specialClass: 'wizard',
        text: t('headSpecialSummerMageText'),
        notes: t('headSpecialSummerMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      summerHealer: {
        event: events.summer,
        specialClass: 'healer',
        text: t('headSpecialSummerHealerText'),
        notes: t('headSpecialSummerHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      fallRogue: {
        event: events.fall,
        specialClass: 'rogue',
        text: t('headSpecialFallRogueText'),
        notes: t('headSpecialFallRogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      fallWarrior: {
        event: events.fall,
        specialClass: 'warrior',
        text: t('headSpecialFallWarriorText'),
        notes: t('headSpecialFallWarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      fallMage: {
        event: events.fall,
        specialClass: 'wizard',
        text: t('headSpecialFallMageText'),
        notes: t('headSpecialFallMageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      fallHealer: {
        event: events.fall,
        specialClass: 'healer',
        text: t('headSpecialFallHealerText'),
        notes: t('headSpecialFallHealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      winter2015Rogue: {
        event: events.winter2015,
        specialClass: 'rogue',
        text: t('headSpecialWinter2015RogueText'),
        notes: t('headSpecialWinter2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      winter2015Warrior: {
        event: events.winter2015,
        specialClass: 'warrior',
        text: t('headSpecialWinter2015WarriorText'),
        notes: t('headSpecialWinter2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      winter2015Mage: {
        event: events.winter2015,
        specialClass: 'wizard',
        text: t('headSpecialWinter2015MageText'),
        notes: t('headSpecialWinter2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      winter2015Healer: {
        event: events.winter2015,
        specialClass: 'healer',
        text: t('headSpecialWinter2015HealerText'),
        notes: t('headSpecialWinter2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      nye2014: {
        text: t('headSpecialNye2014Text'),
        notes: t('headSpecialNye2014Notes'),
        value: 0,
        canOwn: (function(u) {
          return u.items.gear.owned.head_special_nye2014 != null;
        })
      },
      spring2015Rogue: {
        event: events.spring2015,
        specialClass: 'rogue',
        text: t('headSpecialSpring2015RogueText'),
        notes: t('headSpecialSpring2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      spring2015Warrior: {
        event: events.spring2015,
        specialClass: 'warrior',
        text: t('headSpecialSpring2015WarriorText'),
        notes: t('headSpecialSpring2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      spring2015Mage: {
        event: events.spring2015,
        specialClass: 'wizard',
        text: t('headSpecialSpring2015MageText'),
        notes: t('headSpecialSpring2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      spring2015Healer: {
        event: events.spring2015,
        specialClass: 'healer',
        text: t('headSpecialSpring2015HealerText'),
        notes: t('headSpecialSpring2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      summer2015Rogue: {
        event: events.summer2015,
        specialClass: 'rogue',
        text: t('headSpecialSummer2015RogueText'),
        notes: t('headSpecialSummer2015RogueNotes', {
          per: 9
        }),
        value: 60,
        per: 9
      },
      summer2015Warrior: {
        event: events.summer2015,
        specialClass: 'warrior',
        text: t('headSpecialSummer2015WarriorText'),
        notes: t('headSpecialSummer2015WarriorNotes', {
          str: 9
        }),
        value: 60,
        str: 9
      },
      summer2015Mage: {
        event: events.summer2015,
        specialClass: 'wizard',
        text: t('headSpecialSummer2015MageText'),
        notes: t('headSpecialSummer2015MageNotes', {
          per: 7
        }),
        value: 60,
        per: 7
      },
      summer2015Healer: {
        event: events.summer2015,
        specialClass: 'healer',
        text: t('headSpecialSummer2015HealerText'),
        notes: t('headSpecialSummer2015HealerNotes', {
          int: 7
        }),
        value: 60,
        int: 7
      },
      gaymerx: {
        event: events.gaymerx,
        text: t('headSpecialGaymerxText'),
        notes: t('headSpecialGaymerxNotes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('headMystery201402Text'),
        notes: t('headMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201405: {
        text: t('headMystery201405Text'),
        notes: t('headMystery201405Notes'),
        mystery: '201405',
        value: 0
      },
      201406: {
        text: t('headMystery201406Text'),
        notes: t('headMystery201406Notes'),
        mystery: '201406',
        value: 0
      },
      201407: {
        text: t('headMystery201407Text'),
        notes: t('headMystery201407Notes'),
        mystery: '201407',
        value: 0
      },
      201408: {
        text: t('headMystery201408Text'),
        notes: t('headMystery201408Notes'),
        mystery: '201408',
        value: 0
      },
      201411: {
        text: t('headMystery201411Text'),
        notes: t('headMystery201411Notes'),
        mystery: '201411',
        value: 0
      },
      201412: {
        text: t('headMystery201412Text'),
        notes: t('headMystery201412Notes'),
        mystery: '201412',
        value: 0
      },
      201501: {
        text: t('headMystery201501Text'),
        notes: t('headMystery201501Notes'),
        mystery: '201501',
        value: 0
      },
      201505: {
        text: t('headMystery201505Text'),
        notes: t('headMystery201505Notes'),
        mystery: '201505',
        value: 0
      },
      201508: {
        text: t('headMystery201508Text'),
        notes: t('headMystery201508Notes'),
        mystery: '201508',
        value: 0,
        int: 0
      },
      301404: {
        text: t('headMystery301404Text'),
        notes: t('headMystery301404Notes'),
        mystery: '301404',
        value: 0
      },
      301405: {
        text: t('headMystery301405Text'),
        notes: t('headMystery301405Notes'),
        mystery: '301405',
        value: 0
      }
    },
    armoire: {
      lunarCrown: {
        text: t('headArmoireLunarCrownText'),
        notes: t('headArmoireLunarCrownNotes', {
          con: 7,
          per: 7
        }),
        value: 100,
        con: 7,
        per: 7,
        set: 'soothing',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_lunarCrown != null;
        })
      },
      redHairbow: {
        text: t('headArmoireRedHairbowText'),
        notes: t('headArmoireRedHairbowNotes', {
          str: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        str: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_redHairbow != null;
        })
      },
      violetFloppyHat: {
        text: t('headArmoireVioletFloppyHatText'),
        notes: t('headArmoireVioletFloppyHatNotes', {
          per: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        per: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_violetFloppyHat != null;
        })
      },
      gladiatorHelm: {
        text: t('headArmoireGladiatorHelmText'),
        notes: t('headArmoireGladiatorHelmNotes', {
          per: 7,
          int: 7
        }),
        value: 100,
        per: 7,
        int: 7,
        set: 'gladiator',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_gladiatorHelm != null;
        })
      },
      rancherHat: {
        text: t('headArmoireRancherHatText'),
        notes: t('headArmoireRancherHatNotes', {
          str: 5,
          per: 5,
          int: 5
        }),
        value: 100,
        str: 5,
        per: 5,
        int: 5,
        set: 'rancher',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_rancherHat != null;
        })
      },
      royalCrown: {
        text: t('headArmoireRoyalCrownText'),
        notes: t('headArmoireRoyalCrownNotes', {
          str: 10
        }),
        value: 100,
        str: 10,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_royalCrown != null;
        })
      },
      blueHairbow: {
        text: t('headArmoireBlueHairbowText'),
        notes: t('headArmoireBlueHairbowNotes', {
          per: 5,
          int: 5,
          con: 5
        }),
        value: 100,
        per: 5,
        int: 5,
        con: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_blueHairbow != null;
        })
      },
      goldenLaurels: {
        text: t('headArmoireGoldenLaurelsText'),
        notes: t('headArmoireGoldenLaurelsNotes', {
          attrs: 8
        }),
        value: 100,
        per: 8,
        con: 8,
        set: 'goldenToga',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_goldenLaurels != null;
        })
      },
      hornedIronHelm: {
        text: t('headArmoireHornedIronHelmText'),
        notes: t('headArmoireHornedIronHelmNotes', {
          con: 9,
          str: 7
        }),
        value: 100,
        con: 9,
        str: 7,
        set: 'hornedIron',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_hornedIronHelm != null;
        })
      },
      yellowHairbow: {
        text: t('headArmoireYellowHairbowText'),
        notes: t('headArmoireYellowHairbowNotes', {
          attrs: 5
        }),
        int: 5,
        per: 5,
        str: 5,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_yellowHairbow != null;
        })
      },
      redFloppyHat: {
        text: t('headArmoireRedFloppyHatText'),
        notes: t('headArmoireRedFloppyHatNotes', {
          attrs: 6
        }),
        con: 6,
        int: 6,
        per: 6,
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_redFloppyHat != null;
        })
      },
      plagueDoctorHat: {
        text: t('headArmoirePlagueDoctorHatText'),
        notes: t('headArmoirePlagueDoctorHatNotes', {
          int: 5,
          str: 6,
          con: 5
        }),
        int: 5,
        str: 6,
        con: 5,
        set: 'plagueDoctor',
        canOwn: (function(u) {
          return u.items.gear.owned.head_armoire_plagueDoctorHat != null;
        })
      }
    }
  },
  shield: {
    base: {
      0: {
        text: t('shieldBase0Text'),
        notes: t('shieldBase0Notes'),
        value: 0
      }
    },
    warrior: {
      1: {
        text: t('shieldWarrior1Text'),
        notes: t('shieldWarrior1Notes', {
          con: 2
        }),
        con: 2,
        value: 20
      },
      2: {
        text: t('shieldWarrior2Text'),
        notes: t('shieldWarrior2Notes', {
          con: 3
        }),
        con: 3,
        value: 35
      },
      3: {
        text: t('shieldWarrior3Text'),
        notes: t('shieldWarrior3Notes', {
          con: 5
        }),
        con: 5,
        value: 50
      },
      4: {
        text: t('shieldWarrior4Text'),
        notes: t('shieldWarrior4Notes', {
          con: 7
        }),
        con: 7,
        value: 70
      },
      5: {
        text: t('shieldWarrior5Text'),
        notes: t('shieldWarrior5Notes', {
          con: 9
        }),
        con: 9,
        value: 90,
        last: true
      }
    },
    rogue: {
      0: {
        text: t('weaponRogue0Text'),
        notes: t('weaponRogue0Notes'),
        str: 0,
        value: 0
      },
      1: {
        text: t('weaponRogue1Text'),
        notes: t('weaponRogue1Notes', {
          str: 2
        }),
        str: 2,
        value: 20
      },
      2: {
        text: t('weaponRogue2Text'),
        notes: t('weaponRogue2Notes', {
          str: 3
        }),
        str: 3,
        value: 35
      },
      3: {
        text: t('weaponRogue3Text'),
        notes: t('weaponRogue3Notes', {
          str: 4
        }),
        str: 4,
        value: 50
      },
      4: {
        text: t('weaponRogue4Text'),
        notes: t('weaponRogue4Notes', {
          str: 6
        }),
        str: 6,
        value: 70
      },
      5: {
        text: t('weaponRogue5Text'),
        notes: t('weaponRogue5Notes', {
          str: 8
        }),
        str: 8,
        value: 90
      },
      6: {
        text: t('weaponRogue6Text'),
        notes: t('weaponRogue6Notes', {
          str: 10
        }),
        str: 10,
        value: 120,
        last: true
      }
    },
    wizard: {},
    healer: {
      1: {
        text: t('shieldHealer1Text'),
        notes: t('shieldHealer1Notes', {
          con: 2
        }),
        con: 2,
        value: 20
      },
      2: {
        text: t('shieldHealer2Text'),
        notes: t('shieldHealer2Notes', {
          con: 4
        }),
        con: 4,
        value: 35
      },
      3: {
        text: t('shieldHealer3Text'),
        notes: t('shieldHealer3Notes', {
          con: 6
        }),
        con: 6,
        value: 50
      },
      4: {
        text: t('shieldHealer4Text'),
        notes: t('shieldHealer4Notes', {
          con: 9
        }),
        con: 9,
        value: 70
      },
      5: {
        text: t('shieldHealer5Text'),
        notes: t('shieldHealer5Notes', {
          con: 12
        }),
        con: 12,
        value: 90,
        last: true
      }
    },
    special: {
      0: {
        text: t('shieldSpecial0Text'),
        notes: t('shieldSpecial0Notes', {
          per: 20
        }),
        per: 20,
        value: 150,
        canOwn: (function(u) {
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
        canOwn: (function(u) {
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
        canOwn: (function(u) {
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
        canOwn: (function(u) {
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
        canOwn: (function(u) {
          return u.items.gear.owned.shield_armoire_gladiatorShield != null;
        })
      }
    }
  },
  back: {
    base: {
      0: {
        text: t('backBase0Text'),
        notes: t('backBase0Notes'),
        value: 0
      }
    },
    mystery: {
      201402: {
        text: t('backMystery201402Text'),
        notes: t('backMystery201402Notes'),
        mystery: '201402',
        value: 0
      },
      201404: {
        text: t('backMystery201404Text'),
        notes: t('backMystery201404Notes'),
        mystery: '201404',
        value: 0
      },
      201410: {
        text: t('backMystery201410Text'),
        notes: t('backMystery201410Notes'),
        mystery: '201410',
        value: 0
      },
      201504: {
        text: t('backMystery201504Text'),
        notes: t('backMystery201504Notes'),
        mystery: '201504',
        value: 0
      },
      201507: {
        text: t('backMystery201507Text'),
        notes: t('backMystery201507Notes'),
        mystery: '201507',
        value: 0
      }
    },
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
  },
  body: {
    base: {
      0: {
        text: t('bodyBase0Text'),
        notes: t('bodyBase0Notes'),
        value: 0
      }
    },
    special: {
      wondercon_red: {
        text: t('bodySpecialWonderconRedText'),
        notes: t('bodySpecialWonderconRedNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_gold: {
        text: t('bodySpecialWonderconGoldText'),
        notes: t('bodySpecialWonderconGoldNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      wondercon_black: {
        text: t('bodySpecialWonderconBlackText'),
        notes: t('bodySpecialWonderconBlackNotes'),
        value: 0,
        mystery: 'wondercon'
      },
      summerHealer: {
        event: events.summer,
        specialClass: 'healer',
        text: t('bodySpecialSummerHealerText'),
        notes: t('bodySpecialSummerHealerNotes'),
        value: 20
      },
      summerMage: {
        event: events.summer,
        specialClass: 'wizard',
        text: t('bodySpecialSummerMageText'),
        notes: t('bodySpecialSummerMageNotes'),
        value: 20
      },
      summer2015Healer: {
        event: events.summer2015,
        specialClass: 'healer',
        text: t('bodySpecialSummer2015HealerText'),
        notes: t('bodySpecialSummer2015HealerNotes'),
        value: 20
      },
      summer2015Mage: {
        event: events.summer2015,
        specialClass: 'wizard',
        text: t('bodySpecialSummer2015MageText'),
        notes: t('bodySpecialSummer2015MageNotes'),
        value: 20
      },
      summer2015Rogue: {
        event: events.summer2015,
        specialClass: 'rogue',
        text: t('bodySpecialSummer2015RogueText'),
        notes: t('bodySpecialSummer2015RogueNotes'),
        value: 20
      },
      summer2015Warrior: {
        event: events.summer2015,
        specialClass: 'warrior',
        text: t('bodySpecialSummer2015WarriorText'),
        notes: t('bodySpecialSummer2015WarriorNotes'),
        value: 20
      }
    }
  },
  headAccessory: {
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
  },
  eyewear: {
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
  }
};

export default gear;
