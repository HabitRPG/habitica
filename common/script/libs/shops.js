import _ from 'lodash';
import content from '../content/index';
import i18n from '../../../common/script/i18n';

let shops = {};

shops.getMarketCategories = function getMarket (user, language) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: i18n.t('eggs', language),
    notes: i18n.t('dropsExplanation', language),
  };
  eggsCategory.items = _(content.questEggs).values().filter(egg => egg.canBuy(user)).concat(_.values(content.dropEggs)).map(egg => {
    return {
      key: egg.key,
      text: i18n.t('egg', {eggType: egg.text()}, language),
      notes: egg.notes(language),
      value: egg.value,
      class: 'Pet_Egg_'+egg.key,
      locked: false,
      currency: 'gems',
    }
  }).sortBy('key');
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: i18n.t('hatchingPotions', language),
    notes: i18n.t('dropsExplanation', language),
  };
  hatchingPotionsCategory.items = _(content.hatchingPotions).values().filter(hp => !hp.limited).map(hatchingPotion => {
    return {
      key: hatchingPotion.key,
      text: hatchingPotion.text(language),
      notes: hatchingPotion.notes(language),
      class: 'Pet_HatchingPotion_' + hatchingPotion.key,
      value: hatchingPotion.value,
      locked: false,
      currency: 'gems',
    }
  }).sortBy('key');
  categories.push(hatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = _(content.food).values().filter(food => food.canDrop || food.key === 'Saddle').map(foodItem => {
    return {
      key: foodItem.key,
      text: foodItem.text(language),
      notes: foodItem.notes(language),
      class: 'Pet_Food_'+foodItem.key,
      value: foodItem.value,
      locked: false,
      currency: 'gems',
  }
  }).sortBy('key');
  categories.push(foodCategory);

  return categories;
};

shops.getMemoizedMarketCategories = _.memoize(shops.getMarketCategories);

shops.getTimeTravelerCategories = function getTimeTravelerCategories (language, user) {

};


shops.getSeasonalShopCategories = function getSeasonalShopCategories (language) {
  let availableSets = {
    summerWarrior:i18n.t("daringSwashbucklerSet", language),
    summerMage:i18n.t("emeraldMermageSet", language),
    summerHealer:i18n.t("reefSeahealerSet", language),
    summerRogue:i18n.t("roguishPirateSet", language),
    summer2015Warrior:i18n.t("sunfishWarriorSet", language),
    summer2015Mage:i18n.t("shipSoothsayerSet", language),
    summer2015Healer:i18n.t("strappingSailorSet", language),
    summer2015Rogue:i18n.t("reefRenegadeSet", language)
  };

  let categories = [];

  for (let key in availableSets) {
    let category = {
      identifier: key,
      text: availableSets[key]
    };

    var flatGearArray = _.toArray(content.gear.flat);

    category.items = _(flatGearArray).where({index: key}).map(gear => {
      return {
        key: gear.key,
        text: gear.text(language),
        notes: gear.notes(language),
        value: gear.value,
        type: gear.type,
        specialClass: gear.specialClass,
        locked: false,
        currency: 'gems'
      };
    });
    categories.push(category);
  }

  return categories;
};

shops.getMemoizedSeasonalShopCategories = _.memoize(shops.getSeasonalShopCategories);


module.exports = shops;