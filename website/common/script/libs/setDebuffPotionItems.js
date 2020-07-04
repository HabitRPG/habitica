import getDebuffPotionItems from './getDebuffPotionItems';

function clearDebuffPotion (user) {
  return user.pinnedItems.filter(item => item.type !== 'debuffPotion');
}

export default function setDebuffPotionItems (user) {
  user.pinnedItems = clearDebuffPotion(user);

  const debuffPotionItems = getDebuffPotionItems(user);

  if (debuffPotionItems.length) {
    let isPresent = false;
    const isUserHaveDebuffInPinnedItems = user.pinnedItems.find(pinnedItem => {
      debuffPotionItems.forEach(debuffPotion => {
        if (!isPresent) {
          isPresent = debuffPotion.path === pinnedItem.path;
        }
      });
      return isPresent;
    });

    if (!isUserHaveDebuffInPinnedItems) {
      user.pinnedItems.push(...debuffPotionItems);
    }
  }

  return user;
}
