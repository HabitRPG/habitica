import getDebuffPotionItem from './getDebuffPotionItem';


module.exports = function setDebuffPotionItem (user) {
  const debuffPotionItems = getDebuffPotionItem(user);

  if (debuffPotionItems.length) {
    const isUserHaveDebuffInPinnedItems = user.pinnedItems.find(pinnedItem => {
      let isPresent = false;
      debuffPotionItems.forEach(debuffPotion => {
        if (!isPresent) {
          isPresent = debuffPotion.path === pinnedItem;
        }
      });
      return isPresent;
    });

    if (!isUserHaveDebuffInPinnedItems) {
      user.pinnedItems.push(...debuffPotionItems);
    }
  } else {
    user.pinnedItems = user.pinnedItems.filter(item => {
      return item.type !== 'debuffPotion';
    });
  }

  return user;
};


