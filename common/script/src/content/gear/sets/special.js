import {
  setGearSetDefaults,
  translator as t
} from '../../helpers';
import events from '../../events';

let armor = {
  0: {
    con: 20,
    value: 150,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
    })
  },
  1: {
    notes: t('armorSpecial1Notes', {
      attrs: 6
    }),
    con: 6,
    str: 6,
    per: 6,
    int: 6,
    value: 170,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.contributor) != null ? ref.level : void 0) >= 2;
    })
  },
  2: {
    notes: t('armorSpecial2Notes', {
      attrs: 25
    }),
    int: 25,
    con: 25,
    value: 200,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 300 || (u.items.gear.owned.armor_special_2 != null);
    })
  },
  finnedOceanicArmor: {
    str: 15,
    value: 130,
    canOwn: ((u) => {
      return u.items.gear.owned.armor_special_finnedOceanicArmor != null;
    })
  },
  yeti: {
    event: events.winter,
    specialClass: 'warrior',
    con: 9,
    value: 90
  },
  ski: {
    event: events.winter,
    specialClass: 'rogue',
    per: 15,
    value: 90
  },
  candycane: {
    event: events.winter,
    specialClass: 'wizard',
    int: 9,
    value: 90
  },
  snowflake: {
    event: events.winter,
    specialClass: 'healer',
    con: 15,
    value: 90
  },
  birthday: {
    event: events.birthday,
    value: 0
  },
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  springMage: {
    event: events.spring,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  summerMage: {
    event: events.summer,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  fallRogue: {
    event: events.fall,
    specialClass: 'rogue',
    value: 90,
    canBuy: () => { return true; },
    per: 15
  },
  fallWarrior: {
    event: events.fall,
    specialClass: 'warrior',
    value: 90,
    canBuy: () => { return true; },
    con: 9
  },
  fallMage: {
    event: events.fall,
    specialClass: 'wizard',
    value: 90,
    canBuy: () => { return true; },
    int: 9
  },
  fallHealer: {
    event: events.fall,
    specialClass: 'healer',
    value: 90,
    canBuy: () => { return true; },
    con: 15
  },
  winter2015Rogue: {
    event: events.winter2015,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  winter2015Warrior: {
    event: events.winter2015,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  winter2015Mage: {
    event: events.winter2015,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  winter2015Healer: {
    event: events.winter2015,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  birthday2015: {
    value: 0,
    canOwn: ((u) => {
      return u.items.gear.owned.armor_special_birthday2015 != null;
    })
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  spring2015Mage: {
    event: events.spring2015,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  summer2015Mage: {
    event: events.summer2015,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  fall2015Rogue: {
    event: events.fall2015,
    specialClass: 'rogue',
    value: 90,
    per: 15
  },
  fall2015Warrior: {
    event: events.fall2015,
    specialClass: 'warrior',
    value: 90,
    con: 9
  },
  fall2015Mage: {
    event: events.fall2015,
    specialClass: 'wizard',
    value: 90,
    int: 9
  },
  fall2015Healer: {
    event: events.fall2015,
    specialClass: 'healer',
    value: 90,
    con: 15
  },
  gaymerx: {
    event: events.gaymerx,
    value: 0
  }
};

let back = {
  wondercon_red: {
    value: 0,
    mystery: 'wondercon'
  },
  wondercon_black: {
    value: 0,
    mystery: 'wondercon'
  }
};

let body = {
  wondercon_red: {
    value: 0,
    mystery: 'wondercon'
  },
  wondercon_gold: {
    value: 0,
    mystery: 'wondercon'
  },
  wondercon_black: {
    value: 0,
    mystery: 'wondercon'
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    value: 20
  },
  summerMage: {
    event: events.summer,
    specialClass: 'wizard',
    value: 20
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    value: 20
  },
  summer2015Mage: {
    event: events.summer2015,
    specialClass: 'wizard',
    value: 20
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    value: 20
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    value: 20
  }
};

let eyewear = {
  wondercon_red: {
    value: 0,
    mystery: 'wondercon'
  },
  wondercon_black: {
    value: 0,
    mystery: 'wondercon'
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    value: 20
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    value: 20
  }
};

let head = {
  0: {
    int: 20,
    value: 150,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
    })
  },
  1: {
    notes: t('headSpecial1Notes', {
      attrs: 6
    }),
    con: 6,
    str: 6,
    per: 6,
    int: 6,
    value: 170,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.contributor) != null ? ref.level : void 0) >= 3;
    })
  },
  2: {
    notes: t('headSpecial2Notes', {
      attrs: 25
    }),
    int: 25,
    str: 25,
    value: 200,
    canOwn: ((u) => {
      var ref;
      return (+((ref = u.backer) != null ? ref.tier : void 0) >= 300) || (u.items.gear.owned.head_special_2 != null);
    })
  },
  fireCoralCirclet: {
    per: 15,
    value: 130,
    canOwn: ((u) => {
      return u.items.gear.owned.head_special_fireCoralCirclet != null;
    })
  },
  nye: {
    event: events.winter,
    value: 0
  },
  yeti: {
    event: events.winter,
    specialClass: 'warrior',
    str: 9,
    value: 60
  },
  ski: {
    event: events.winter,
    specialClass: 'rogue',
    per: 9,
    value: 60
  },
  candycane: {
    event: events.winter,
    specialClass: 'wizard',
    per: 7,
    value: 60
  },
  snowflake: {
    event: events.winter,
    specialClass: 'healer',
    int: 7,
    value: 60
  },
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  springMage: {
    event: events.spring,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  summerMage: {
    event: events.summer,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  fallRogue: {
    event: events.fall,
    specialClass: 'rogue',
    value: 60,
    canBuy: () => { return true; },
    per: 9
  },
  fallWarrior: {
    event: events.fall,
    specialClass: 'warrior',
    value: 60,
    canBuy: () => { return true; },
    str: 9
  },
  fallMage: {
    event: events.fall,
    specialClass: 'wizard',
    value: 60,
    canBuy: () => { return true; },
    per: 7
  },
  fallHealer: {
    event: events.fall,
    specialClass: 'healer',
    value: 60,
    canBuy: () => { return true; },
    int: 7
  },
  winter2015Rogue: {
    event: events.winter2015,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  winter2015Warrior: {
    event: events.winter2015,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  winter2015Mage: {
    event: events.winter2015,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  winter2015Healer: {
    event: events.winter2015,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  nye2014: {
    value: 0,
    canOwn: ((u) => {
      return u.items.gear.owned.head_special_nye2014 != null;
    })
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  spring2015Mage: {
    event: events.spring2015,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  summer2015Mage: {
    event: events.summer2015,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  fall2015Rogue: {
    event: events.fall2015,
    specialClass: 'rogue',
    value: 60,
    per: 9
  },
  fall2015Warrior: {
    event: events.fall2015,
    specialClass: 'warrior',
    value: 60,
    str: 9
  },
  fall2015Mage: {
    event: events.fall2015,
    specialClass: 'wizard',
    value: 60,
    per: 7
  },
  fall2015Healer: {
    event: events.fall2015,
    specialClass: 'healer',
    value: 60,
    int: 7
  },
  gaymerx: {
    event: events.gaymerx,
    value: 0
  }
};

let headAccessory = {
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    value: 20
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    value: 20
  },
  springMage: {
    event: events.spring,
    specialClass: 'wizard',
    value: 20
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    value: 20
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    value: 20
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    value: 20
  },
  spring2015Mage: {
    event: events.spring2015,
    specialClass: 'wizard',
    value: 20
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    value: 20
  },
  bearEars: {
    gearSet: 'animal',
    text: t('headAccessoryBearEarsText'),
    notes: t('headAccessoryBearEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_bearEars != null;
    })
  },
  cactusEars: {
    gearSet: 'animal',
    text: t('headAccessoryCactusEarsText'),
    notes: t('headAccessoryCactusEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_cactusEars != null;
    })
  },
  foxEars: {
    gearSet: 'animal',
    text: t('headAccessoryFoxEarsText'),
    notes: t('headAccessoryFoxEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_foxEars != null;
    })
  },
  lionEars: {
    gearSet: 'animal',
    text: t('headAccessoryLionEarsText'),
    notes: t('headAccessoryLionEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_lionEars != null;
    })
  },
  pandaEars: {
    gearSet: 'animal',
    text: t('headAccessoryPandaEarsText'),
    notes: t('headAccessoryPandaEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_pandaEars != null;
    })
  },
  pigEars: {
    gearSet: 'animal',
    text: t('headAccessoryPigEarsText'),
    notes: t('headAccessoryPigEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_pigEars != null;
    })
  },
  tigerEars: {
    gearSet: 'animal',
    text: t('headAccessoryTigerEarsText'),
    notes: t('headAccessoryTigerEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_tigerEars != null;
    })
  },
  wolfEars: {
    gearSet: 'animal',
    text: t('headAccessoryWolfEarsText'),
    notes: t('headAccessoryWolfEarsNotes'),
    value: 20,
    canBuy: () => { return true; },
    canOwn: ((u) => {
      return u.items.gear.owned.headAccessory_special_wolfEars != null;
    })
  }
};

let shield = {
  0: {
    per: 20,
    value: 150,
    canOwn: ((u) => {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 45;
    })
  },
  1: {
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
    con: 15,
    value: 130,
    canOwn: ((u) => {
      return u.items.gear.owned.shield_special_moonpearlShield != null;
    })
  },
  yeti: {
    event: events.winter,
    specialClass: 'warrior',
    con: 7,
    value: 70
  },
  ski: {
    text: t('weaponSpecialSkiText'),
    notes: t('weaponSpecialSkiNotes', {
      str: 8
    }),
    event: events.winter,
    specialClass: 'rogue',
    str: 8,
    value: 90
  },
  snowflake: {
    event: events.winter,
    specialClass: 'healer',
    con: 9,
    value: 70
  },
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    value: 70,
    con: 9
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    value: 70,
    con: 9
  },
  fallRogue: {
    event: events.fall,
    specialClass: 'rogue',
    value: 80,
    canBuy: () => { return true; },
    str: 8
  },
  fallWarrior: {
    event: events.fall,
    specialClass: 'warrior',
    value: 70,
    canBuy: () => { return true; },
    con: 7
  },
  fallHealer: {
    event: events.fall,
    specialClass: 'healer',
    value: 70,
    canBuy: () => { return true; },
    con: 9
  },
  winter2015Rogue: {
    event: events.winter2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  winter2015Warrior: {
    event: events.winter2015,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  winter2015Healer: {
    event: events.winter2015,
    specialClass: 'healer',
    value: 70,
    con: 9
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    value: 70,
    con: 9
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    value: 70,
    con: 9
  },
  fall2015Rogue: {
    event: events.fall2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  fall2015Warrior: {
    event: events.fall2015,
    specialClass: 'warrior',
    value: 70,
    con: 7
  },
  fall2015Healer: {
    event: events.fall2015,
    specialClass: 'healer',
    value: 70,
    con: 9
  }
};

let weapon = {
  0: {
    str: 20,
    value: 150,
    canOwn: (function(u) {
      var ref;
      return +((ref = u.backer) != null ? ref.tier : void 0) >= 70;
    })
  },
  1: {
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
    int: 15,
    value: 130,
    canOwn: (function(u) {
      return u.items.gear.owned.weapon_special_tridentOfCrashingTides != null;
    })
  },
  yeti: {
    event: events.winter,
    specialClass: 'warrior',
    str: 15,
    value: 90
  },
  ski: {
    event: events.winter,
    specialClass: 'rogue',
    str: 8,
    value: 90
  },
  candycane: {
    event: events.winter,
    specialClass: 'wizard',
    twoHanded: true,
    int: 15,
    per: 7,
    value: 160
  },
  snowflake: {
    event: events.winter,
    specialClass: 'healer',
    int: 9,
    value: 90
  },
  springRogue: {
    event: events.spring,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  springWarrior: {
    event: events.spring,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  springMage: {
    event: events.spring,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  springHealer: {
    event: events.spring,
    specialClass: 'healer',
    value: 90,
    int: 9
  },
  summerRogue: {
    event: events.summer,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  summerWarrior: {
    event: events.summer,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  summerMage: {
    event: events.summer,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  summerHealer: {
    event: events.summer,
    specialClass: 'healer',
    value: 90,
    int: 9
  },
  fallRogue: {
    event: events.fall,
    specialClass: 'rogue',
    value: 80,
    canBuy: () => { return true; },
    str: 8
  },
  fallWarrior: {
    event: events.fall,
    specialClass: 'warrior',
    value: 90,
    canBuy: () => { return true; },
    str: 15
  },
  fallMage: {
    event: events.fall,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    canBuy: () => { return true; },
    int: 15,
    per: 7
  },
  fallHealer: {
    event: events.fall,
    specialClass: 'healer',
    value: 90,
    canBuy: () => { return true; },
    int: 9
  },
  winter2015Rogue: {
    event: events.winter2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  winter2015Warrior: {
    event: events.winter2015,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  winter2015Mage: {
    event: events.winter2015,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  winter2015Healer: {
    event: events.winter2015,
    specialClass: 'healer',
    value: 90,
    int: 9
  },
  spring2015Rogue: {
    event: events.spring2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  spring2015Warrior: {
    event: events.spring2015,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  spring2015Mage: {
    event: events.spring2015,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  spring2015Healer: {
    event: events.spring2015,
    specialClass: 'healer',
    value: 90,
    int: 9
  },
  summer2015Rogue: {
    event: events.summer2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  summer2015Warrior: {
    event: events.summer2015,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  summer2015Mage: {
    event: events.summer2015,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  summer2015Healer: {
    event: events.summer2015,
    specialClass: 'healer',
    value: 90,
    int: 9
  },
  fall2015Rogue: {
    event: events.fall2015,
    specialClass: 'rogue',
    value: 80,
    str: 8
  },
  fall2015Warrior: {
    event: events.fall2015,
    specialClass: 'warrior',
    value: 90,
    str: 15
  },
  fall2015Mage: {
    event: events.fall2015,
    specialClass: 'wizard',
    twoHanded: true,
    value: 160,
    int: 15,
    per: 7
  },
  fall2015Healer: {
    event: events.fall2015,
    specialClass: 'healer',
    value: 90,
    int: 9
  }
};

let specialSet = {
  armor: armor,
  back: back,
  body: body,
  eyewear: eyewear,
  head: head,
  headAccessory: headAccessory,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(specialSet, {setName: 'special'});

export default specialSet;
