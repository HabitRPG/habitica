import {translator as t} from '../../helpers';
import events from '../../events';

export var armor = {
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
    value: 100,
    int: 6,
    str: 5,
    con: 6,
    set: 'plagueDoctor',
    canOwn: (function(u) {
      return u.items.gear.owned.armor_armoire_plagueDoctorOvercoat != null;
    })
  }
};
