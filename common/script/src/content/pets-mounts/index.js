import {transform, defaults} from 'lodash';
import hatchingPotions from '../hatching-potions';
import dropEggs from '../eggs/drops';
import questEggs from '../eggs/quest';

import specialPets from './special-pets';
import specialMounts from './special-mounts';

let dropPets = generateAnimalSet(dropEggs);
let questPets = generateAnimalSet(questEggs);
let dropMounts = generateAnimalSet(dropEggs);
let questMounts = generateAnimalSet(questEggs);

function generateAnimalSet(set) {
  return transform(set, function(m, egg) {
    defaults(m, transform(hatchingPotions, function(m2, pot) {
      return m2[egg.key + "-" + pot.key] = true;
    }));
  });
}

export default {
  dropPets: dropPets,
  dropMounts: dropMounts,
  questPets: questPets,
  questMounts: questMounts,
  specialPets: specialPets,
  specialMounts: specialMounts,
}
