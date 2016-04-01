import _ from 'lodash';
import content from '../content/index';
import i18n from '../i18n';
import { daysSince } from '../cron';
import { diminishingReturns } from '../statHelpers';

// Clone a drop object maintaining its functions so that we can change it without affecting the original item
function cloneDropItem (drop) {
  return _.cloneDeep(drop, function (val) {
    return _.isFunction(val) ? val : undefined; // undefined will be handled by lodash
  });
}

module.exports = function randomDrop (user, modifiers, req) {
  var acceptableDrops, base, base1, base2, chance, drop, dropK, dropMultiplier, name, name1, name2, quest, rarity, ref, ref1, ref2, ref3, task;
  task = modifiers.task;
  chance = _.min([Math.abs(task.value - 21.27), 37.5]) / 150 + .02;
  chance *= task.priority * (1 + (task.streak / 100 || 0)) * (1 + (user._statsComputed.per / 100)) * (1 + (user.contributor.level / 40 || 0)) * (1 + (user.achievements.rebirths / 20 || 0)) * (1 + (user.achievements.streak / 200 || 0)) * (user._tmp.crit || 1) * (1 + .5 * (_.reduce(task.checklist, (function(m, i) {
    return m + (i.completed ? 1 : 0);
  }), 0) || 0));
  chance = diminishingReturns(chance, 0.75);
  quest = content.quests[(ref = user.party.quest) != null ? ref.key : void 0];
  if ((quest != null ? quest.collect : void 0) && user.fns.predictableRandom(user.stats.gp) < chance) {
    dropK = user.fns.randomVal(quest.collect, {
      key: true
    });
    user.party.quest.progress.collect[dropK]++;
    if (typeof user.markModified === "function") {
      user.markModified('party.quest.progress');
    }
  }
  dropMultiplier = ((ref1 = user.purchased) != null ? (ref2 = ref1.plan) != null ? ref2.customerId : void 0 : void 0) ? 2 : 1;
  if ((daysSince(user.items.lastDrop.date, user.preferences) === 0) && (user.items.lastDrop.count >= dropMultiplier * (5 + Math.floor(user._statsComputed.per / 25) + (user.contributor.level || 0)))) {
    return;
  }
  if (((ref3 = user.flags) != null ? ref3.dropsEnabled : void 0) && user.fns.predictableRandom(user.stats.exp) < chance) {
    rarity = user.fns.predictableRandom(user.stats.gp);
    if (rarity > .6) {
      drop = cloneDropItem(user.fns.randomVal(_.where(content.food, {
        canDrop: true
      })));
      if ((base = user.items.food)[name = drop.key] == null) {
        base[name] = 0;
      }
      user.items.food[drop.key] += 1;
      drop.type = 'Food';
      drop.dialog = i18n.t('messageDropFood', {
        dropArticle: drop.article,
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language)
      }, req.language);
    } else if (rarity > .3) {
      drop = cloneDropItem(user.fns.randomVal(content.dropEggs));
      if ((base1 = user.items.eggs)[name1 = drop.key] == null) {
        base1[name1] = 0;
      }
      user.items.eggs[drop.key]++;
      drop.type = 'Egg';
      drop.dialog = i18n.t('messageDropEgg', {
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language)
      }, req.language);
    } else {
      acceptableDrops = rarity < .02 ? ['Golden'] : rarity < .09 ? ['Zombie', 'CottonCandyPink', 'CottonCandyBlue'] : rarity < .18 ? ['Red', 'Shade', 'Skeleton'] : ['Base', 'White', 'Desert'];
      drop = cloneDropItem(user.fns.randomVal(_.pick(content.hatchingPotions, (function(v, k) {
        return acceptableDrops.indexOf(k) >= 0;
      }))));
      if ((base2 = user.items.hatchingPotions)[name2 = drop.key] == null) {
        base2[name2] = 0;
      }
      user.items.hatchingPotions[drop.key]++;
      drop.type = 'HatchingPotion';
      drop.dialog = i18n.t('messageDropPotion', {
        dropText: drop.text(req.language),
        dropNotes: drop.notes(req.language)
      }, req.language);
    }
    user._tmp.drop = drop;
    user.items.lastDrop.date = +(new Date);
    return user.items.lastDrop.count++;
  }
};
