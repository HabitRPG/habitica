import getDebuffPotionItems from './getDebuffPotionItems';


export default function setDebuffPotionItems (user) {
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
  } else {
    user.pinnedItems = user.pinnedItems.filter(item => item.type !== 'debuffPotion');
  }

  return user;
}
