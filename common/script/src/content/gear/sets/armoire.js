import {
  translator as t,
  setGearSetDefaults
} from '../../helpers';

let armor = {
  lunarArmor: {
    value: 100,
    str: 7,
    int: 7,
    set: 'soothing',
    canOwn: ((u) => {
      return u.items.gear.owned.armor_armoire_lunarArmor != null;
    })
  },
  gladiatorArmor: {
    value: 100,
    str: 7,
    per: 7,
    set: 'gladiator',
    canOwn: ((u) => {
      return u.items.gear.owned.armor_armoire_gladiatorArmor != null;
    })
  },
  rancherRobes: {
    value: 100,
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
    canOwn: ((u) => {
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
    canOwn: ((u) => {
      return u.items.gear.owned.armor_armoire_goldenToga != null;
    })
  },
  hornedIronArmor: {
    value: 100,
    con: 9,
    per: 7,
    set: 'hornedIron',
    canOwn: ((u) => {
      return u.items.gear.owned.armor_armoire_hornedIronArmor != null;
    })
  },
  plagueDoctorOvercoat: {
    value: 100,
    int: 6,
    str: 5,
    con: 6,
    set: 'plagueDoctor',
    canOwn: ((u) => {
      return u.items.gear.owned.armor_armoire_plagueDoctorOvercoat != null;
    })
  }
};

let eyewear = {
  plagueDoctorMask: {
    value: 100,
    set: 'plagueDoctor',
    canOwn: ((u) => {
      return u.items.gear.owned.eyewear_armoire_plagueDoctorMask != null;
    })
  }
};

let head = {
  lunarCrown: {
    value: 100,
    con: 7,
    per: 7,
    set: 'soothing',
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_lunarCrown != null;
    })
  },
  redHairbow: {
    value: 100,
    str: 5,
    int: 5,
    con: 5,
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_redHairbow != null;
    })
  },
  violetFloppyHat: {
    value: 100,
    per: 5,
    int: 5,
    con: 5,
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_violetFloppyHat != null;
    })
  },
  gladiatorHelm: {
    value: 100,
    per: 7,
    int: 7,
    set: 'gladiator',
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_gladiatorHelm != null;
    })
  },
  rancherHat: {
    value: 100,
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_rancherHat != null;
    })
  },
  royalCrown: {
    value: 100,
    str: 10,
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_royalCrown != null;
    })
  },
  blueHairbow: {
    value: 100,
    per: 5,
    int: 5,
    con: 5,
    canOwn: ((u) => {
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
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_goldenLaurels != null;
    })
  },
  hornedIronHelm: {
    value: 100,
    con: 9,
    str: 7,
    set: 'hornedIron',
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_hornedIronHelm != null;
    })
  },
  yellowHairbow: {
    notes: t('headArmoireYellowHairbowNotes', {
      attrs: 5
    }),
    value: 100,
    int: 5,
    per: 5,
    str: 5,
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_yellowHairbow != null;
    })
  },
  redFloppyHat: {
    notes: t('headArmoireRedFloppyHatNotes', {
      attrs: 6
    }),
    value: 100,
    con: 6,
    int: 6,
    per: 6,
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_redFloppyHat != null;
    })
  },
  plagueDoctorHat: {
    value: 100,
    int: 5,
    str: 6,
    con: 5,
    set: 'plagueDoctor',
    canOwn: ((u) => {
      return u.items.gear.owned.head_armoire_plagueDoctorHat != null;
    })
  },
  blackCat: {
    notes: t('headArmoireBlackCatNotes', {
      attrs: 9
    }),
    value: 100,
    int: 9,
    per: 9,
    canOwn: (function(u) {
      return u.items.gear.owned.head_armoire_blackCat != null;
    })
  },
  orangeCat: {
    notes: t('headArmoireOrangeCatNotes', {
      attrs: 9
    }),
    value: 100,
    con: 9,
    str: 9,
    canOwn: (function(u) {
      return u.items.gear.owned.head_armoire_orangeCat != null;
    })
  },
};

let shield = {
  gladiatorShield: {
    value: 100,
    con: 5,
    str: 5,
    set: 'gladiator',
    canOwn: ((u) => {
      return u.items.gear.owned.shield_armoire_gladiatorShield != null;
    })
  },
  midnightShield: {
    value: 100,
    con: 10,
    str: 2,
    canOwn: ((u) => {
      return u.items.gear.owned.shield_armoire_midnightShield != null;
    })
  },
};

let weapon = {
  basicCrossbow: {
    value: 100,
    str: 5,
    per: 5,
    con: 5,
    canOwn: (function(u) {
      return u.items.gear.owned.weapon_armoire_basicCrossbow != null;
    })
  },
  lunarSceptre: {
    value: 100,
    con: 7,
    int: 7,
    set: 'soothing',
    canOwn: (function(u) {
      return u.items.gear.owned.weapon_armoire_lunarSceptre != null;
    })
  },
  rancherLasso: {
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
  },
  batWand: {
    value: 100,
    int: 10,
    per: 2,
    canOwn: (function(u) {
      return u.items.gear.owned.weapon_armoire_batWand != null;
    })
  }
};

let armoireSet = {
  armor: armor,
  eyewear: eyewear,
  head: head,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(armoireSet, {setName: 'armoire'});

export default armoireSet;
