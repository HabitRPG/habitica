import { translator as t } from '../helpers';
import {each} from 'lodash';

let snowball = {
  text: t('spellSpecialSnowballAuraText'),
  mana: 0,
  value: 15,
  target: 'user',
  notes: t('spellSpecialSnowballAuraNotes'),
  cast: (user, target) => {
    var base;
    resetVisualBuffs(target);
    target.stats.buffs.snowball = true;

    if ((base = target.achievements).snowball == null) {
      base.snowball = 0;
    }
    target.achievements.snowball++;
    return user.items.special.snowball--;
  }
};

let salt = {
  text: t('spellSpecialSaltText'),
  mana: 0,
  value: 5,
  immediateUse: true,
  target: 'self',
  notes: t('spellSpecialSaltNotes'),
  cast: (user, target) => {
    user.stats.buffs.snowball = false;
    return user.stats.gp -= 5;
  }
};

let spookDust = {
  text: t('spellSpecialSpookDustText'),
  mana: 0,
  value: 15,
  target: 'user',
  notes: t('spellSpecialSpookDustNotes'),
  cast: (user, target) => {
    var base;
    resetVisualBuffs(target);
    target.stats.buffs.spookDust = true;

    if ((base = target.achievements).spookDust == null) {
      base.spookDust = 0;
    }
    target.achievements.spookDust++;
    return user.items.special.spookDust--;
  }
};

let opaquePotion = {
  text: t('spellSpecialOpaquePotionText'),
  mana: 0,
  value: 5,
  immediateUse: true,
  target: 'self',
  notes: t('spellSpecialOpaquePotionNotes'),
  cast: (user, target) => {
    user.stats.buffs.spookDust = false;
    return user.stats.gp -= 5;
  }
};

let shinySeed = {
  text: t('spellSpecialShinySeedText'),
  mana: 0,
  value: 15,
  target: 'user',
  notes: t('spellSpecialShinySeedNotes'),
  cast: (user, target) => {
    var base;
    resetVisualBuffs(target);

    target.stats.buffs.shinySeed = true;

    if ((base = target.achievements).shinySeed == null) {
      base.shinySeed = 0;
    }
    target.achievements.shinySeed++;
    return user.items.special.shinySeed--;
  }
};

let petalFreePotion = {
  text: t('spellSpecialPetalFreePotionText'),
  mana: 0,
  value: 5,
  immediateUse: true,
  target: 'self',
  notes: t('spellSpecialPetalFreePotionNotes'),
  cast: (user, target) => {
    user.stats.buffs.shinySeed = false;
    return user.stats.gp -= 5;
  }
};

let seafoam = {
  text: t('spellSpecialSeafoamText'),
  mana: 0,
  value: 15,
  target: 'user',
  notes: t('spellSpecialSeafoamNotes'),
  cast: (user, target) => {
    var base;
    resetVisualBuffs(target);
    target.stats.buffs.seafoam = true;

    if ((base = target.achievements).seafoam == null) {
      base.seafoam = 0;
    }
    target.achievements.seafoam++;
    return user.items.special.seafoam--;
  }
};

let sand = {
  text: t('spellSpecialSandText'),
  mana: 0,
  value: 5,
  immediateUse: true,
  target: 'self',
  notes: t('spellSpecialSandNotes'),
  cast: (user, target) => {
    user.stats.buffs.seafoam = false;
    return user.stats.gp -= 5;
  }
};

let nye = {
  text: t('nyeCard'),
  mana: 0,
  value: 10,
  immediateUse: true,
  silent: true,
  target: 'user',
  notes: t('nyeCardNotes'),
  cast: (user, target) => {
    var base;
    if (user === target) {
      if ((base = user.achievements).nye == null) {
        base.nye = 0;
      }
      user.achievements.nye++;
    } else {
      each([user, target], (t) => {
        var base1;
        if ((base1 = t.achievements).nye == null) {
          base1.nye = 0;
        }
        return t.achievements.nye++;
      });
    }
    if (!target.items.special.nyeReceived) {
      target.items.special.nyeReceived = [];
    }
    target.items.special.nyeReceived.push(user.profile.name);
    target.flags.cardReceived = true;
    if (typeof target.markModified === "function") {
      target.markModified('items.special.nyeReceived');
    }
    return user.stats.gp -= 10;
  }
};

let valentine = {
  text: t('valentineCard'),
  mana: 0,
  value: 10,
  immediateUse: true,
  silent: true,
  target: 'user',
  notes: t('valentineCardNotes'),
  cast: (user, target) => {
    var base;
    if (user === target) {
      if ((base = user.achievements).valentine == null) {
        base.valentine = 0;
      }
      user.achievements.valentine++;
    } else {
      each([user, target], (t) => {
        var base1;
        if ((base1 = t.achievements).valentine == null) {
          base1.valentine = 0;
        }
        return t.achievements.valentine++;
      });
    }
    if (!target.items.special.valentineReceived) {
      target.items.special.valentineReceived = [];
    }
    target.items.special.valentineReceived.push(user.profile.name);
    target.flags.cardReceived = true;
    if (typeof target.markModified === "function") {
      target.markModified('items.special.valentineReceived');
    }
    return user.stats.gp -= 10;
  }
};

let greeting = {
  text: t('greetingCard'),
  mana: 0,
  value: 10,
  immediateUse: true,
  silent: true,
  target: 'user',
  notes: t('greetingCardNotes'),
  cast: (user, target) => {
    var base;
    if (user === target) {
      if ((base = user.achievements).greeting == null) {
        base.greeting = 0;
      }
      user.achievements.greeting++;
    } else {
      each([user, target], (t) => {
        var base1;
        if ((base1 = t.achievements).greeting == null) {
          base1.greeting = 0;
        }
        return t.achievements.greeting++;
      });
    }
    if (!target.items.special.greetingReceived) {
      target.items.special.greetingReceived = [];
    }
    target.items.special.greetingReceived.push(user.profile.name);
    target.flags.cardReceived = true;
    if (typeof target.markModified === "function") {
      target.markModified('items.special.greetingReceived');
    }
    return user.stats.gp -= 10;
  }
};

let thankyou = {
  text: t('thankyouCard'),
  mana: 0,
  value: 10,
  immediateUse: true,
  silent: true,
  target: 'user',
  notes: t('thankyouCardNotes'),
  cast: (user, target) => {
    var base;
    if (user === target) {
      if ((base = user.achievements).thankyou == null) {
        base.thankyou = 0;
      }
      user.achievements.thankyou++;
    } else {
      each([user, target], (t) => {
        var base1;
        if ((base1 = t.achievements).thankyou == null) {
          base1.thankyou = 0;
        }
        return t.achievements.thankyou++;
      });
    }
    if (!target.items.special.thankyouReceived) {
      target.items.special.thankyouReceived = [];
    }
    target.items.special.thankyouReceived.push(user.profile.name);
    target.flags.cardReceived = true;
    if (typeof target.markModified === "function") {
      target.markModified('items.special.thankyouReceived');
    }
    return user.stats.gp -= 10;
  }
};

function resetVisualBuffs(target) {
  target.stats.buffs.snowball = false;
  target.stats.buffs.spookDust = false;
  target.stats.buffs.shinySeed = false;
  target.stats.buffs.seafoam = false;
}

let special = {
  snowball: snowball,
  salt: salt,
  spookDust: spookDust,
  opaquePotion: opaquePotion,
  shinySeed: shinySeed,
  petalFreePotion: petalFreePotion,
  seafoam: seafoam,
  sand: sand,
  nye: nye,
  valentine: valentine,
  greeting: greeting,
  thankyou: thankyou,
};

export default special;
