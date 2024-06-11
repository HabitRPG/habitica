import { drops as eggs } from '../content/eggs';
import { drops as hatchingPotions } from '../content/hatching-potions';
import randomVal from '../libs/randomVal';

export default function firstDrops (user) {
  const eggDrop = randomVal(eggs);
  const potionDrop = randomVal(hatchingPotions);

  user.items.eggs = {
    ...user.items.eggs,
    [eggDrop.key]: user.items.eggs[eggDrop.key] || 0,
  };
  user.items.eggs[eggDrop.key] += 1;
  if (user.markModified) user.markModified('items.eggs');

  user.items.hatchingPotions = {
    ...user.items.hatchingPotions,
    [potionDrop.key]: user.items.hatchingPotions[potionDrop.key] || 0,
  };
  user.items.hatchingPotions[potionDrop.key] += 1;
  if (user.markModified) user.markModified('items.hatchingPotions');

  if (user.addNotification) user.addNotification('FIRST_DROPS', { egg: eggDrop.key, hatchingPotion: potionDrop.key });

  return ({ egg: eggDrop.key, hatchingPotion: potionDrop.key });
}
