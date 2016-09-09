import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import count from '../count';
import splitWhitespace from '../libs/splitWhitespace';
import {
  NotAuthorized,
} from '../libs/errors';
import predictableRandom from '../fns/predictableRandom';
import randomVal from '../fns/randomVal';

module.exports = function buyArmoire (user, req = {}, analytics) {
  let item = content.armoire;

  if (user.stats.gp < item.value) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }

  if (item.canOwn && !item.canOwn(user)) {
    throw new NotAuthorized(i18n.t('cannotBuyItem', req.language));
  }

  let armoireResp;
  let armoireResult;
  let eligibleEquipment;
  let drop;
  let message;

  armoireResult = predictableRandom(user, user.stats.gp);
  eligibleEquipment = _.filter(content.gear.flat, (eligible) => {
    return eligible.klass === 'armoire' && !user.items.gear.owned[eligible.key];
  });

  if (!_.isEmpty(eligibleEquipment) && (armoireResult < 0.6 || !user.flags.armoireOpened)) {
    eligibleEquipment.sort();
    drop = randomVal(user, eligibleEquipment);

    if (user.items.gear.owned[drop.key]) {
      throw new NotAuthorized(i18n.t('equipmentAlradyOwned', req.language));
    }

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

  user.stats.gp -= item.value;

  if (!message) {
    message = i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language);
  }

  if (analytics) {
    analytics.track('acquire item', {
      uuid: user._id,
      itemKey: 'Armoire',
      acquireMethod: 'Gold',
      goldCost: item.value,
      category: 'behavior',
      headers: req.headers,
    });
  }

  let resData = _.pick(user, splitWhitespace('items flags'));
  if (armoireResp) resData.armoire = armoireResp;

  if (req.v2 === true) {
    return resData;
  } else {
    return [
      resData,
      message,
    ];
  }
};
