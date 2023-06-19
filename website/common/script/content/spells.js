import each from 'lodash/each';
import moment from 'moment';
import t from './translation';
import { NotAuthorized, BadRequest } from '../libs/errors';
import statsComputed from '../libs/statsComputed'; // eslint-disable-line import/no-cycle
import setDebuffPotionItems from '../libs/setDebuffPotionItems'; // eslint-disable-line import/no-cycle
import crit from '../fns/crit'; // eslint-disable-line import/no-cycle
import updateStats from '../fns/updateStats';
import { EVENTS } from './constants';

/*
  ---------------------------------------------------------------
  Spells
  ---------------------------------------------------------------
  Text, notes, and mana are obvious. The rest:

  * {target}: one of [task, self, party, user].
  * This is very important, because if the cast() function is expecting one
    thing and receives another, it will cause errors.
    `self` is used for self buffs, multi-task debuffs, AOEs (eg, meteor-shower),
    etc. Basically, use self for anything that's not [task, party, user] and is an instant-cast

  * {cast}: the function that's run to perform the ability's action.
    This is pretty slick - because this is exported to the
    web, this function can be performed on the client and on the server.
    `user` param is self (needed for determining your
    own stats for effectiveness of cast), and `target` param is one of [task, party, user].
    In the case of `self` skills,
    you act on `user` instead of `target`. You can trust these are the correct objects,
    as long as the `target` attr of the
    spell is correct. Take a look at habitrpg/website/server/models/user.js and
    habitrpg/website/server/models/task.js for what attributes are
    available on each model. Note `task.value` is its "redness".
    If party is passed in, it's an array of users,
    so you'll want to iterate over them like: `_.each(target,function(member){...})`

  Note, user.stats.mp is docked after automatically
  (it's appended to functions automatically down below in an _.each)
 */

function diminishingReturns (bonus, max, halfway) {
  if (!halfway) halfway = max / 2; // eslint-disable-line no-param-reassign
  return max * (bonus / (bonus + halfway));
}

function calculateBonus (value, stat, critVal = 1, statScale = 0.5) {
  return (value < 0 ? 1 : value + 1) + stat * statScale * critVal;
}

export function stealthBuffsToAdd (user) {
  return Math.ceil(diminishingReturns(
    statsComputed(user).per, user.tasksOrder.dailys.length * 0.64, 55,
  ));
}

const spells = {};

spells.wizard = {
  fireball: { // Burst of Flames
    text: t('spellWizardFireballText'),
    mana: 10,
    lvl: 11,
    target: 'task',
    notes: t('spellWizardFireballNotes'),
    cast (user, target, req) {
      let bonus = statsComputed(user).int * crit.crit(user, 'per');
      bonus *= Math.ceil((target.value < 0 ? 1 : target.value + 1) * 0.075);
      user.stats.exp += diminishingReturns(bonus, 75);
      if (!user.party.quest.progress.up) user.party.quest.progress.up = 0;
      user.party.quest.progress.up += Math.ceil(statsComputed(user).int * 0.1);
      updateStats(user, user.stats, req);
    },
  },
  mpheal: { // Ethereal Surge
    text: t('spellWizardMPHealText'),
    mana: 30,
    lvl: 12,
    target: 'party',
    notes: t('spellWizardMPHealNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).int;
      data.query['stats.class'] = { $ne: 'wizard' };
      data.update = { $inc: { 'stats.mp': Math.ceil(diminishingReturns(bonus, 25, 125)) } };
    },
  },
  earth: { // Earthquake
    text: t('spellWizardEarthText'),
    mana: 35,
    lvl: 13,
    target: 'party',
    notes: t('spellWizardEarthNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).int - user.stats.buffs.int;
      data.update = { $inc: { 'stats.buffs.int': Math.ceil(diminishingReturns(bonus, 30, 200)) } };
    },
  },
  frost: { // Chilling Frost
    text: t('spellWizardFrostText'),
    mana: 40,
    lvl: 14,
    target: 'self',
    notes: t('spellWizardFrostNotes'),
    cast (user, target, req) {
      // Check if chilling frost skill has been previously casted or not.
      // See #12361 for more details.
      if (user.stats.buffs.streaks === true) throw new BadRequest(t('spellAlreadyCast')(req.language));
      user.stats.buffs.streaks = true;
    },
  },
};

spells.warrior = {
  smash: { // Brutal Smash
    text: t('spellWarriorSmashText'),
    mana: 10,
    lvl: 11,
    target: 'task',
    notes: t('spellWarriorSmashNotes'),
    cast (user, target) {
      const bonus = statsComputed(user).str * crit.crit(user, 'con');
      target.value += diminishingReturns(bonus, 2.5, 35);
      if (!user.party.quest.progress.up) user.party.quest.progress.up = 0;
      user.party.quest.progress.up += diminishingReturns(bonus, 55, 70);
    },
  },
  defensiveStance: { // Defensive Stance
    text: t('spellWarriorDefensiveStanceText'),
    mana: 25,
    lvl: 12,
    target: 'self',
    notes: t('spellWarriorDefensiveStanceNotes'),
    cast (user) {
      const bonus = statsComputed(user).con - user.stats.buffs.con;
      if (!user.stats.buffs.con) user.stats.buffs.con = 0;
      user.stats.buffs.con += Math.ceil(diminishingReturns(bonus, 40, 200));
    },
  },
  valorousPresence: { // Valorous Presence
    text: t('spellWarriorValorousPresenceText'),
    mana: 20,
    lvl: 13,
    target: 'party',
    notes: t('spellWarriorValorousPresenceNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).str - user.stats.buffs.str;
      data.update = { $inc: { 'stats.buffs.str': Math.ceil(diminishingReturns(bonus, 20, 200)) } };
    },
  },
  intimidate: { // Intimidating Gaze
    text: t('spellWarriorIntimidateText'),
    mana: 15,
    lvl: 14,
    target: 'party',
    notes: t('spellWarriorIntimidateNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).con - user.stats.buffs.con;
      data.update = { $inc: { 'stats.buffs.con': Math.ceil(diminishingReturns(bonus, 24, 200)) } };
    },
  },
};

spells.rogue = {
  pickPocket: { // Pickpocket
    text: t('spellRoguePickPocketText'),
    mana: 10,
    lvl: 11,
    target: 'task',
    notes: t('spellRoguePickPocketNotes'),
    cast (user, target) {
      const bonus = calculateBonus(target.value, statsComputed(user).per);
      user.stats.gp += diminishingReturns(bonus, 25, 75);
    },
  },
  backStab: { // Backstab
    text: t('spellRogueBackStabText'),
    mana: 15,
    lvl: 12,
    target: 'task',
    notes: t('spellRogueBackStabNotes'),
    cast (user, target, req) {
      const _crit = crit.crit(user, 'str', 0.3);
      const bonus = calculateBonus(target.value, statsComputed(user).str, _crit);
      user.stats.exp += diminishingReturns(bonus, 75, 50);
      user.stats.gp += diminishingReturns(bonus, 18, 75);
      updateStats(user, user.stats, req);
    },
  },
  toolsOfTrade: { // Tools of the Trade
    text: t('spellRogueToolsOfTradeText'),
    mana: 25,
    lvl: 13,
    target: 'party',
    notes: t('spellRogueToolsOfTradeNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).per - user.stats.buffs.per;
      data.update = { $inc: { 'stats.buffs.per': Math.ceil(diminishingReturns(bonus, 100, 50)) } };
    },
  },
  stealth: { // Stealth
    text: t('spellRogueStealthText'),
    mana: 45,
    lvl: 14,
    target: 'self',
    notes: t('spellRogueStealthNotes'),
    cast (user) {
      if (!user.stats.buffs.stealth) user.stats.buffs.stealth = 0;
      user.stats.buffs.stealth += stealthBuffsToAdd(user);
    },
  },
};

spells.healer = {
  heal: { // Healing Light
    text: t('spellHealerHealText'),
    mana: 15,
    lvl: 11,
    target: 'self',
    notes: t('spellHealerHealNotes'),
    cast (user, target, req) {
      if (user.stats.hp >= 50) throw new NotAuthorized(t('messageHealthAlreadyMax')(req.language));
      user.stats.hp += (statsComputed(user).con + statsComputed(user).int + 5) * 0.075;
      if (user.stats.hp > 50) user.stats.hp = 50;
    },
  },
  brightness: { // Searing Brightness
    text: t('spellHealerBrightnessText'),
    mana: 15,
    lvl: 12,
    target: 'tasks',
    notes: t('spellHealerBrightnessNotes'),
    cast (user, tasks) {
      each(tasks, task => {
        if (task.type !== 'reward') {
          task.value += 4 * (statsComputed(user).int / (statsComputed(user).int + 40));
        }
      });
    },
  },
  protectAura: { // Protective Aura
    text: t('spellHealerProtectAuraText'),
    mana: 30,
    lvl: 13,
    target: 'party',
    notes: t('spellHealerProtectAuraNotes'),
    bulk: true,
    cast (user, data) {
      const bonus = statsComputed(user).con - user.stats.buffs.con;
      data.update = { $inc: { 'stats.buffs.con': Math.ceil(diminishingReturns(bonus, 200, 200)) } };
    },
  },
  healAll: { // Blessing
    text: t('spellHealerHealAllText'),
    mana: 25,
    lvl: 14,
    target: 'party',
    notes: t('spellHealerHealAllNotes'),
    cast (user, target) {
      each(target, member => {
        member.stats.hp += (statsComputed(user).con + statsComputed(user).int + 5) * 0.04;
        if (member.stats.hp > 50) member.stats.hp = 50;
      });
    },
  },
};

spells.special = {
  snowball: {
    text: t('spellSpecialSnowballAuraText'),
    mana: 0,
    value: 15,
    previousPurchase: true,
    target: 'user',
    notes: t('spellSpecialSnowballAuraNotes'),
    canOwn () {
      return moment().isBetween('2022-12-27T08:00-05:00', EVENTS.winter2023.end);
    },
    cast (user, target, req) {
      if (!user.items.special.snowball) throw new NotAuthorized(t('spellNotOwned')(req.language));
      target.stats.buffs.snowball = true;
      target.stats.buffs.spookySparkles = false;
      target.stats.buffs.shinySeed = false;
      target.stats.buffs.seafoam = false;
      if (!target.achievements.snowball) target.achievements.snowball = 0;
      target.achievements.snowball += 1;
      user.items.special.snowball -= 1;
      setDebuffPotionItems(user);
    },
  },
  salt: {
    text: t('spellSpecialSaltText'),
    mana: 0,
    value: 5,
    immediateUse: true,
    purchaseType: 'debuffPotion',
    target: 'self',
    notes: t('spellSpecialSaltNotes'),
    cast (user) {
      user.stats.buffs.snowball = false;
      user.stats.gp -= 5;
      setDebuffPotionItems(user);
    },
  },
  spookySparkles: {
    text: t('spellSpecialSpookySparklesText'),
    mana: 0,
    value: 15,
    previousPurchase: true,
    target: 'user',
    notes: t('spellSpecialSpookySparklesNotes'),
    canOwn () {
      return moment().isBetween('2021-10-11T08:00-04:00', EVENTS.fall2022.end);
    },
    cast (user, target, req) {
      if (!user.items.special.spookySparkles) throw new NotAuthorized(t('spellNotOwned')(req.language));
      target.stats.buffs.snowball = false;
      target.stats.buffs.spookySparkles = true;
      target.stats.buffs.shinySeed = false;
      target.stats.buffs.seafoam = false;
      if (!target.achievements.spookySparkles) target.achievements.spookySparkles = 0;
      target.achievements.spookySparkles += 1;
      user.items.special.spookySparkles -= 1;
      setDebuffPotionItems(user);
    },
  },
  opaquePotion: {
    text: t('spellSpecialOpaquePotionText'),
    mana: 0,
    value: 5,
    immediateUse: true,
    purchaseType: 'debuffPotion',
    target: 'self',
    notes: t('spellSpecialOpaquePotionNotes'),
    cast (user) {
      user.stats.buffs.spookySparkles = false;
      user.stats.gp -= 5;
      setDebuffPotionItems(user);
    },
  },
  shinySeed: {
    text: t('spellSpecialShinySeedText'),
    mana: 0,
    value: 15,
    previousPurchase: true,
    target: 'user',
    notes: t('spellSpecialShinySeedNotes'),
    event: EVENTS.spring2023,
    canOwn () {
      return moment().isBetween('2023-04-18T08:00-05:00', EVENTS.spring2023.end);
    },
    cast (user, target, req) {
      if (!user.items.special.shinySeed) throw new NotAuthorized(t('spellNotOwned')(req.language));
      target.stats.buffs.snowball = false;
      target.stats.buffs.spookySparkles = false;
      target.stats.buffs.shinySeed = true;
      target.stats.buffs.seafoam = false;
      if (!target.achievements.shinySeed) target.achievements.shinySeed = 0;
      target.achievements.shinySeed += 1;
      user.items.special.shinySeed -= 1;
      setDebuffPotionItems(user);
    },
  },
  petalFreePotion: {
    text: t('spellSpecialPetalFreePotionText'),
    mana: 0,
    value: 5,
    immediateUse: true,
    purchaseType: 'debuffPotion',
    target: 'self',
    notes: t('spellSpecialPetalFreePotionNotes'),
    cast (user) {
      user.stats.buffs.shinySeed = false;
      user.stats.gp -= 5;
      setDebuffPotionItems(user);
    },
  },
  seafoam: {
    text: t('spellSpecialSeafoamText'),
    mana: 0,
    value: 15,
    previousPurchase: true,
    target: 'user',
    notes: t('spellSpecialSeafoamNotes'),
    canOwn () {
      return moment().isBetween('2023-07-11T08:00-04:00', EVENTS.summer2023.end);
    },
    cast (user, target, req) {
      if (!user.items.special.seafoam) throw new NotAuthorized(t('spellNotOwned')(req.language));
      target.stats.buffs.snowball = false;
      target.stats.buffs.spookySparkles = false;
      target.stats.buffs.shinySeed = false;
      target.stats.buffs.seafoam = true;
      if (!target.achievements.seafoam) target.achievements.seafoam = 0;
      target.achievements.seafoam += 1;
      user.items.special.seafoam -= 1;
      setDebuffPotionItems(user);
    },
  },
  sand: {
    text: t('spellSpecialSandText'),
    mana: 0,
    value: 5,
    immediateUse: true,
    purchaseType: 'debuffPotion',
    target: 'self',
    notes: t('spellSpecialSandNotes'),
    cast (user) {
      user.stats.buffs.seafoam = false;
      user.stats.gp -= 5;
      setDebuffPotionItems(user);
    },
  },
  nye: {
    text: t('nyeCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('nyeCardNotes'),
    canOwn () {
      return moment().isBetween('2022-12-28T08:00-05:00', '2023-01-02T20:00-05:00');
    },
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.nye) user.achievements.nye = 0;
        user.achievements.nye += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.nye) u.achievements.nye = 0;
          u.achievements.nye += 1;
        });
      }

      if (!target.items.special.nyeReceived) target.items.special.nyeReceived = [];
      const senderName = user.profile.name;
      target.items.special.nyeReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'nye',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  valentine: {
    text: t('valentineCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('valentineCardNotes'),
    canOwn () {
      return moment().isBetween('2023-02-13T08:00-05:00', '2023-02-17T23:59-05:00');
    },
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.valentine) user.achievements.valentine = 0;
        user.achievements.valentine += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.valentine) u.achievements.valentine = 0;
          u.achievements.valentine += 1;
        });
      }

      if (!target.items.special.valentineReceived) target.items.special.valentineReceived = [];
      const senderName = user.profile.name;
      target.items.special.valentineReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'valentine',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  greeting: {
    text: t('greetingCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('greetingCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.greeting) user.achievements.greeting = 0;
        user.achievements.greeting += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.greeting) u.achievements.greeting = 0;
          u.achievements.greeting += 1;
        });
      }

      if (!target.items.special.greetingReceived) target.items.special.greetingReceived = [];
      const senderName = user.profile.name;
      target.items.special.greetingReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'greeting',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  thankyou: {
    text: t('thankyouCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('thankyouCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.thankyou) user.achievements.thankyou = 0;
        user.achievements.thankyou += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.thankyou) u.achievements.thankyou = 0;
          u.achievements.thankyou += 1;
        });
      }

      if (!target.items.special.thankyouReceived) target.items.special.thankyouReceived = [];
      const senderName = user.profile.name;
      target.items.special.thankyouReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'thankyou',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  birthday: {
    text: t('birthdayCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('birthdayCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.birthday) user.achievements.birthday = 0;
        user.achievements.birthday += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.birthday) u.achievements.birthday = 0;
          u.achievements.birthday += 1;
        });
      }

      if (!target.items.special.birthdayReceived) target.items.special.birthdayReceived = [];
      const senderName = user.profile.name;
      target.items.special.birthdayReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'birthday',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  congrats: {
    text: t('congratsCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('congratsCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.congrats) user.achievements.congrats = 0;
        user.achievements.congrats += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.congrats) u.achievements.congrats = 0;
          u.achievements.congrats += 1;
        });
      }

      if (!target.items.special.congratsReceived) target.items.special.congratsReceived = [];
      const senderName = user.profile.name;
      target.items.special.congratsReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'congrats',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  getwell: {
    text: t('getwellCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('getwellCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.getwell) user.achievements.getwell = 0;
        user.achievements.getwell += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.getwell) u.achievements.getwell = 0;
          u.achievements.getwell += 1;
        });
      }

      if (!target.items.special.getwellReceived) target.items.special.getwellReceived = [];
      const senderName = user.profile.name;
      target.items.special.getwellReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'getwell',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
  goodluck: {
    text: t('goodluckCard'),
    mana: 0,
    value: 10,
    immediateUse: true,
    silent: true,
    target: 'user',
    notes: t('goodluckCardNotes'),
    cast (user, target) {
      if (user === target) {
        if (!user.achievements.goodluck) user.achievements.goodluck = 0;
        user.achievements.goodluck += 1;
      } else {
        each([user, target], u => {
          if (!u.achievements.goodluck) u.achievements.goodluck = 0;
          u.achievements.goodluck += 1;
        });
      }

      if (!target.items.special.goodluckReceived) target.items.special.goodluckReceived = [];
      const senderName = user.profile.name;
      target.items.special.goodluckReceived.push(senderName);

      if (target.addNotification) {
        target.addNotification('CARD_RECEIVED', {
          card: 'goodluck',
          from: {
            id: user._id,
            name: senderName,
          },
        });
      }
      target.flags.cardReceived = true;

      user.stats.gp -= 10;
    },
  },
};

each(spells, spellClass => {
  each(spellClass, (spell, key) => {
    spell.key = key;
    const _cast = spell.cast;
    spell.cast = function castSpell (user, target, req) {
      _cast(user, target, req);
      user.stats.mp -= spell.mana;
    };
  });
});

export default spells;
