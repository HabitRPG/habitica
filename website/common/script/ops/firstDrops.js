import { drops as eggs } from '../content/eggs';
import { drops as hatchingPotions } from '../content/hatching-potions';
import { cloneDropItem } from '../fns/randomDrop';
import randomVal from '../libs/randomVal';

export default function firstDrops (user) {
  const eggDrop = cloneDropItem(randomVal(eggs));
  const potionDrop = cloneDropItem(randomVal(hatchingPotions));

  user.items.eggs = {
    ...user.items.eggs,
    [eggDrop.key]: user.items.eggs[eggDrop.key] || 0,
  };
  user.items.eggs[eggDrop.key] += 1;

  user.items.hatchingPotions = {
    ...user.items.hatchingPotions,
    [potionDrop.key]: user.items.hatchingPotions[potionDrop.key] || 0,
  };
  user.items.hatchingPotions[potionDrop.key] += 1;

  if (user.addNotification) user.addNotification('FIRST_DROPS', { eggDrop, potionDrop });
}
