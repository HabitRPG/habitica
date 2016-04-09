import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import count from '../count';
import splitWhitespace from '../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import predictableRandom from '../fns/predictableRandom';
import randomVal from '../fns/randomVal';
import handleTwoHanded from '../fns/handleTwoHanded';
import ultimateGear from '../fns/ultimateGear';

module.exports = function buy (user, req = {}, analytics) {
  let key = _.get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item;
  if (key === 'potion') {
    item = content.potion;
  } else if (key === 'armoire') {
    item = content.armoire;
  } else {
    item = content.gear.flat[key];
  }
  if (!item) throw new NotFound(i18n.t('itemNotFound', {key}, req.language));

  if (user.stats.gp < item.value) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }

  if (item.canOwn && !item.canOwn(user)) {
    throw new NotAuthorized(i18n.t('cannoyBuyItem', req.language));
  }

  let armoireResp;
  let armoireResult;
  let eligibleEquipment;
  let drop;
  let message;

  if (item.key === 'potion') {
    user.stats.hp += 15;
    if (user.stats.hp > 50) {
      user.stats.hp = 50;
    }
  } else if (item.key === 'armoire') {
    armoireResult = predictableRandom(user, user.stats.gp);
    eligibleEquipment = _.filter(content.gear.flat, (eligible) => {
      return eligible.klass === 'armoire' && !user.items.gear.owned[eligible.key];
    });

    if (!_.isEmpty(eligibleEquipment) && (armoireResult < 0.6 || !user.flags.armoireOpened)) {
      eligibleEquipment.sort();
      drop = randomVal(user, eligibleEquipment);

      user.items.gear.owned[drop.key] = true;
      user.flags.armoireOpened = true;
      message = i18n.t('armoireEquipment', {
        image: `<span class="shop_${drop.key} pull-left"></span>`,
        dropText: drop.text(req.language),
      }, req.language);

      if (count.remainingGearInSet(user.items.gear.owned, 'armoire') === 0) {
        user.flags.armoireEmpty = true;
      }

      armoireResp = {
        type: 'gear',
        dropKey: drop.key,
        dropText: drop.text(req.language),
      };
    } else if ((!_.isEmpty(eligibleEquipment) && armoireResult < 0.8) || armoireResult < 0.5) { // eslint-disable-line no-extra-parens
      drop = randomVal(user, _.where(content.food, {
        canDrop: true,
      }));
      user.items.food[drop.key] = user.items.food[drop.key] || 0;
      user.items.food[drop.key] += 1;

      message = i18n.t('armoireFood', {
        image: `<span class="Pet_Food_${drop.key} pull-left"></span>`,
        dropArticle: drop.article,
        dropText: drop.text(req.language),
      }, req.language);
      armoireResp = {
        type: 'food',
        dropKey: drop.key,
        dropArticle: drop.article,
        dropText: drop.text(req.language),
      };
    } else {
      let armoireExp = Math.floor(predictableRandom(user, user.stats.exp) * 40 + 10);
      user.stats.exp += armoireExp;
      message = i18n.t('armoireExp', req.language);
      armoireResp = {
        type: 'experience',
        value: armoireExp,
      };
    }
  } else {
    if (user.preferences.autoEquip) {
      user.items.gear.equipped[item.type] = item.key;
      message = handleTwoHanded(user, item, undefined, req);
    }
    user.items.gear.owned[item.key] = true;

    if (item.last) ultimateGear(user);
  }

  user.stats.gp -= item.value;

  if (!message) {
    message = i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language);
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: key,
      acquireMethod: 'Gold',
      goldCost: item.value,
      category: 'behavior',
    });
  }

  let res = {
    data: _.pick(user, splitWhitespace('items achievements stats flags')),
    message,
  };

  if (armoireResp) res.armoire = armoireResp;

  if (req.v2 === true) {
    return res.data;
  } else {
    return res;
  }
};
