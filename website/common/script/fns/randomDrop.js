import _ from 'lodash';
import content from '../content/index';
import i18n from '../i18n';
import { daysSince } from '../cron';
import { diminishingReturns } from '../statHelpers';
import randomVal from '../libs/randomVal';

// TODO This is only used on the server
// move to user model as an instance method?

// Clone a drop object maintaining its functions so that we can change it without affecting the original item
function cloneDropItem (drop) {
  return _.cloneDeep(drop, (val) => {
    return _.isFunction(val) ? val : undefined; // undefined will be handled by lodash
  });
}

function trueRandom () {
  return Math.random();
}

module.exports = function randomDrop (user, options, req = {}) {
  let acceptableDrops;
  let drop;
  let dropMultiplier;
  let rarity;

  let predictableRandom = options.predictableRandom || trueRandom;
  let task = options.task;

  let chance = _.min([Math.abs(task.value - 21.27), 37.5]) / 150 + 0.02;
  chance *= task.priority *                             // Task priority: +50% for Medium, +100% for Hard
    (1 + (task.streak / 100 || 0)) *                    // Streak bonus: +1% per streak
    (1 + user._statsComputed.per / 100) *               // PERception: +1% per point
    (1 + (user.contributor.level / 40 || 0)) *          // Contrib levels: +2.5% per level
    (1 + (user.achievements.rebirths / 20 || 0)) *      // Rebirths: +5% per achievement
    (1 + (user.achievements.streak / 200 || 0)) *       // Streak achievements: +0.5% per achievement
    (user._tmp.crit || 1) * (1 + 0.5 * (_.reduce(task.checklist, (m, i) => {
      return m + (i.completed ? 1 : 0); // +50% per checklist item complete. TODO: make this into X individual drop chances instead
    }, 0) || 0));
  chance = diminishingReturns(chance, 0.75);

  if (predictableRandom() < chance) {
    if (!user.party.quest.progress.collectedItems) user.party.quest.progress.collectedItems = 0;
    user.party.quest.progress.collectedItems++;
    if (!user._tmp.quest) user._tmp.quest = {};
    user._tmp.quest.collection = 1;
    user.markModified('party.quest.progress');
  }

  if (user.purchased && user.purchased.plan && user.purchased.plan.customerId) {
    dropMultiplier = 2;
  } else {
    dropMultiplier = 1;
  }

  if (daysSince(user.items.lastDrop.date, user.preferences) === 0 &&
      user.items.lastDrop.count >= dropMultiplier * (5 + Math.floor(user._statsComputed.per / 25) + (user.contributor.level || 0))) {
    return;
  }

  if (user.flags && user.flags.dropsEnabled && predictableRandom() < chance) {
    rarity = predictableRandom();

    if (rarity > 0.6) { // food 40% chance
      drop = cloneDropItem(randomVal(_.where(content.food, {
        canDrop: true,
      })));

      if (!user.items.food[drop.key]) {
        user.items.food[drop.key] = 0;
      }
      user.items.food[drop.key] += 1;
      drop.type = 'Food';
      drop.dialog = i18n.t('messageDropFood', {
        dropArticle: drop.article,
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language),
      }, req.language);
    } else if (rarity > 0.3) { // eggs 30% chance
      drop = cloneDropItem(randomVal(content.dropEggs));
      if (!user.items.eggs[drop.key]) {
        user.items.eggs[drop.key] = 0;
      }
      user.items.eggs[drop.key]++;
      drop.type = 'Egg';
      drop.dialog = i18n.t('messageDropEgg', {
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language),
      }, req.language);
    } else { // Hatching Potion, 30% chance - break down by rarity.
      if (rarity < 0.02) { // Very Rare: 10% (of 30%)
        acceptableDrops = ['Golden'];
      } else if (rarity < 0.09) { // Rare: 20% of 30%
        acceptableDrops = ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'];
      } else if (rarity < 0.18) { // uncommon: 30% of 30%
        acceptableDrops = ['Red', 'Shade', 'Skeleton'];
      } else { // common, 40% of 30%
        acceptableDrops = ['Base', 'White', 'Desert'];
      }
      drop = cloneDropItem(randomVal(_.pick(content.hatchingPotions, (v, k) => {
        return acceptableDrops.indexOf(k) >= 0;
      })));
      if (!user.items.hatchingPotions[drop.key]) {
        user.items.hatchingPotions[drop.key] = 0;
      }
      user.items.hatchingPotions[drop.key]++;
      drop.type = 'HatchingPotion';
      drop.dialog = i18n.t('messageDropPotion', {
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language),
      }, req.language);
    }

    user._tmp.drop = drop;
    user.items.lastDrop.date = Number(new Date());
    user.items.lastDrop.count++;
  }
};
