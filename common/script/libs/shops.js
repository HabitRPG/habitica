import _ from 'lodash';
import content from '../content/index';
import t from '../content/translation';

let shops = {};

shops.getMarketCategories = function getMarket (language, user) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: t('eggs')(language),
    notes: t('dropsExplanation')(language),
  };
  let eggs = _.map(_.values(content.questEggs).filter(egg => egg.canBuy(user)), egg => {
    return {
      key: egg.key,
      text: t('egg', {eggType: egg.text()})(language),
      notes: egg.notes(language),
      value: egg.value,
    }
  });
  eggs = eggs.concat(_.map(_.values(content.dropEggs), egg => {
    return {
      key: egg.key,
      text: t('egg', {eggType: egg.text()})(language),
      notes: egg.notes(language),
      value: egg.value,
    }
  }));
  _.each(eggs, egg => {
    egg.class = 'Pet_Egg_'+egg.key;
    egg.locked = false;
    egg.currency = 'gems';
  });
  eggsCategory.items = _.sortBy(eggs, 'key');
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: t('hatchingPotions')(language),
    notes: t('dropsExplanation')(language),
  };
  let hatchingPotions = _.map(_.values(content.hatchingPotions).filter(hp => !hp.limited), hatchingPotion => {
    return {
      key: hatchingPotion.key,
      text: hatchingPotion.text(language),
      notes: hatchingPotion.notes(language),
      class: 'Pet_HatchingPotion_' + hatchingPotion.key,
      value: hatchingPotion.value,
      locked: false,
      currency: 'gems',
    }
  });
  hatchingPotionsCategory.items = _.sortBy(hatchingPotions, 'key');
  categories.push(hatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: t('food')(language),
    notes: t('dropsExplanation')(language),
  };
  let food = _.map(_.values(content.food).filter(food => food.canDrop || food.key === 'Saddle'), foodItem => {
    return {
      key: foodItem.key,
      text: foodItem.text(language),
      notes: foodItem.notes(language),
      class: 'Pet_Food_'+foodItem.key,
      value: foodItem.value,
      locked: false,
      currency: 'gems',
  }
  });
  foodCategory.items = _.sortBy(food, 'key');
  categories.push(foodCategory);

  return categories;
};

shops.getMemoizedMarketCategories = _.memoize(shops.getMarketCategories);

shops.getTimeTravelerCategories = function getTimeTravelerCategories (language, user) {

};


shops.getSeasonalShopCategories = function getSeasonalShopCategories (language) {
  let availableSets = {
    summerWarrior:t("daringSwashbucklerSet")(language),
    summerMage:t("emeraldMermageSet")(language),
    summerHealer:t("reefSeahealerSet")(language),
    summerRogue:t("roguishPirateSet")(language),
    summer2015Warrior:t("sunfishWarriorSet")(language),
    summer2015Mage:t("shipSoothsayerSet")(language),
    summer2015Healer:t("strappingSailorSet")(language),
    summer2015Rogue:t("reefRenegadeSet")(language)
  };

  let categories = [];

  for (let key in availableSets) {
    let category = {
      identifier: key,
      text: availableSets[key]
    };

    var flatGearArray = _.toArray(content.gear.flat);

    category.items = _.map(_.where(flatGearArray, {index: key}), gear => {
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