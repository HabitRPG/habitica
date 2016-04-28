import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import count from '../count';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb, analytics) {
  var analyticsData, armoireExp, armoireResp, armoireResult, base, buyResp, drop, eligibleEquipment, item, key, message, name;
  key = req.params.key;
  item = key === 'potion' ? content.potion : key === 'armoire' ? content.armoire : content.gear.flat[key];
  if (!item) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: "Item '" + key + " not found (see https://github.com/HabitRPG/habitrpg/blob/develop/common/script/content/index.js)"
    }) : void 0;
  }
  if (user.stats.gp < item.value) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageNotEnoughGold', req.language)
    }) : void 0;
  }
  if ((item.canOwn != null) && !item.canOwn(user)) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: "You can't buy this item"
    }) : void 0;
  }
  armoireResp = void 0;
  if (item.key === 'potion') {
    user.stats.hp += 15;
    if (user.stats.hp > 50) {
      user.stats.hp = 50;
    }
  } else if (item.key === 'armoire') {
    armoireResult = user.fns.predictableRandom(user.stats.gp);
    eligibleEquipment = _.filter(content.gear.flat, (function(i) {
      return i.klass === 'armoire' && !user.items.gear.owned[i.key];
    }));
    if (!_.isEmpty(eligibleEquipment) && (armoireResult < .6 || !user.flags.armoireOpened)) {
      eligibleEquipment.sort();
      drop = user.fns.randomVal(eligibleEquipment);
      user.items.gear.owned[drop.key] = true;
      user.flags.armoireOpened = true;
      message = i18n.t('armoireEquipment', {
        image: '<span class="shop_' + drop.key + ' pull-left"></span>',
        dropText: drop.text(req.language)
      }, req.language);
      if (count.remainingGearInSet(user.items.gear.owned, 'armoire') === 0) {
        user.flags.armoireEmpty = true;
      }
      armoireResp = {
        type: "gear",
        dropKey: drop.key,
        dropText: drop.text(req.language)
      };
    } else if ((!_.isEmpty(eligibleEquipment) && armoireResult < .8) || armoireResult < .5) {
      drop = user.fns.randomVal(_.where(content.food, {
        canDrop: true
      }));
      if ((base = user.items.food)[name = drop.key] == null) {
        base[name] = 0;
      }
      user.items.food[drop.key] += 1;
      message = i18n.t('armoireFood', {
        image: '<span class="Pet_Food_' + drop.key + ' pull-left"></span>',
        dropArticle: drop.article,
        dropText: drop.text(req.language)
      }, req.language);
      armoireResp = {
        type: "food",
        dropKey: drop.key,
        dropArticle: drop.article,
        dropText: drop.text(req.language)
      };
    } else {
      armoireExp = Math.floor(user.fns.predictableRandom(user.stats.exp) * 40 + 10);
      user.stats.exp += armoireExp;
      message = i18n.t('armoireExp', req.language);
      armoireResp = {
        "type": "experience",
        "value": armoireExp
      };
    }
  } else {
    if (user.preferences.autoEquip) {
      user.items.gear.equipped[item.type] = item.key;
      message = user.fns.handleTwoHanded(item, null, req);
    }
    user.items.gear.owned[item.key] = true;
    if (message == null) {
      message = i18n.t('messageBought', {
        itemText: item.text(req.language)
      }, req.language);
    }
    if (item.last) {
      user.fns.ultimateGear();
    }
  }
  user.stats.gp -= item.value;
  analyticsData = {
    uuid: user._id,
    itemKey: key,
    acquireMethod: 'Gold',
    goldCost: item.value,
    category: 'behavior'
  };
  if (analytics != null) {
    analytics.track('acquire item', analyticsData);
  }
  buyResp = _.pick(user, splitWhitespace('items achievements stats flags'));
  if (armoireResp) {
    buyResp["armoire"] = armoireResp;
  }
  return typeof cb === "function" ? cb({
    code: 200,
    message: message
  }, buyResp) : void 0;
};
