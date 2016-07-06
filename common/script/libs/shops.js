import _ from 'lodash';
import content from '../content/index';
import t from '../content/translation';

let shops = {};

shops.getMarketCategories = _.memoize(function getMarket (user) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: t('eggs'),
    notes: t('dropsExplanation'),
  };
  let eggs = _.values(_.cloneDeep(content.questEggs)).filter(egg => egg.canBuy(user));
  eggs = eggs.concat(_.values(_.cloneDeep(content.dropEggs)));
  _.each(eggs, egg => {
    egg.class = 'Pet_Egg_'+egg.key;
    egg.text = t('egg', {eggType: egg.text()});
  });
  eggsCategory.items = _.sortBy(eggs, 'key');
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: t('hatchingPotions'),
    notes: t('dropsExplanation'),
  };
  let hatchingPotions = _.values(_.cloneDeep(content.hatchingPotions)).filter(hp => !hp.limited);
  _.each(hatchingPotions, hatchingPotion => {
    hatchingPotion.class = 'Pet_HatchingPotion_'+hatchingPotion.key;
  });
  hatchingPotionsCategory.items = _.sortBy(hatchingPotions, 'key');
  categories.push(hatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: t('food'),
    notes: t('dropsExplanation'),
  };
  let food = _.values(_.cloneDeep(content.food)).filter(food => food.canDrop || food.key === 'Saddle');
  _.each(food, foodItem => {
    foodItem.class = 'Pet_Food_'+foodItem.key;
  });
  foodCategory.items = _.sortBy(food, 'key');
  categories.push(foodCategory);

  _.each(categories, category => {
    _.each(category.items, item => {
      item.locked = false;
      item.currency = 'gems';
    });
  });

  return categories;
});


module.exports = shops;