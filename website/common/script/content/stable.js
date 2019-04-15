import each from 'lodash/each';
import {
  drops as dropEggs,
  quests as questEggs,
} from './eggs';
import {
  drops as dropPotions,
  premium as premiumPotions,
  wacky as wackyPotions,
} from './hatching-potions';
import t from './translation';

let petInfo = {};
let mountInfo = {};

function constructSet (type, eggs, potions) {
  let pets = {};
  let mounts = {};

  each(eggs, (egg) => {
    each(potions, (potion) => {
      let key = `${egg.key}-${potion.key}`;

      function getAnimalData (text) {
        return {
          key,
          type,
          potion: potion.key,
          egg: egg.key,
          text,
        };
      }

      petInfo[key] = getAnimalData(t('petName', {
        potion: potion.text,
        egg: egg.text,
      }));
      mountInfo[key] = getAnimalData(t('mountName', {
        potion: potion.text,
        mount: egg.mountText,
      }));

      pets[key] = true;
      mounts[key] = true;
    });
  });

  return [pets, mounts];
}

function constructPetOnlySet (type, eggs, potions) {
  let pets = {};

  each(eggs, (egg) => {
    each(potions, (potion) => {
      let key = `${egg.key}-${potion.key}`;

      function getAnimalData (text) {
        return {
          key,
          type,
          potion: potion.key,
          egg: egg.key,
          text,
        };
      }

      petInfo[key] = getAnimalData(t('petName', {
        potion: potion.text,
        egg: egg.text,
      }));
      pets[key] = true;
    });
  });

  return pets;
}

let [dropPets, dropMounts] = constructSet('drop', dropEggs, dropPotions);
let [premiumPets, premiumMounts] = constructSet('premium', dropEggs, premiumPotions);
let [questPets, questMounts] = constructSet('quest', questEggs, dropPotions);
let wackyPets = constructPetOnlySet('wacky', dropEggs, wackyPotions);

let specialPets = {
  'Wolf-Veteran': 'veteranWolf',
  'Wolf-Cerberus': 'cerberusPup',
  'Dragon-Hydra': 'hydra',
  'Turkey-Base': 'turkey',
  'BearCub-Polar': 'polarBearPup',
  'MantisShrimp-Base': 'mantisShrimp',
  'JackOLantern-Base': 'jackolantern',
  'Mammoth-Base': 'mammoth',
  'Tiger-Veteran': 'veteranTiger',
  'Phoenix-Base': 'phoenix',
  'Turkey-Gilded': 'gildedTurkey',
  'MagicalBee-Base': 'magicalBee',
  'Lion-Veteran': 'veteranLion',
  'Gryphon-RoyalPurple': 'royalPurpleGryphon',
  'JackOLantern-Ghost': 'ghostJackolantern',
  'Jackalope-RoyalPurple': 'royalPurpleJackalope',
  'Orca-Base': 'orca',
  'Bear-Veteran': 'veteranBear',
  'Hippogriff-Hopeful': 'hopefulHippogriffPet',
  'Fox-Veteran': 'veteranFox',
  'JackOLantern-Glow': 'glowJackolantern',
};

let specialMounts = {
  'BearCub-Polar': 'polarBear',
  'LionCub-Ethereal': 'etherealLion',
  'MantisShrimp-Base': 'mantisShrimp',
  'Turkey-Base': 'turkey',
  'Mammoth-Base': 'mammoth',
  'Orca-Base': 'orca',
  'Gryphon-RoyalPurple': 'royalPurpleGryphon',
  'Phoenix-Base': 'phoenix',
  'JackOLantern-Base': 'jackolantern',
  'MagicalBee-Base': 'magicalBee',
  'Turkey-Gilded': 'gildedTurkey',
  'Jackalope-RoyalPurple': 'royalPurpleJackalope',
  'Aether-Invisible': 'invisibleAether',
  'JackOLantern-Ghost': 'ghostJackolantern',
  'Hippogriff-Hopeful': 'hopefulHippogriffMount',
};

each(specialPets, (translationString, key) => {
  petInfo[key] = {
    key,
    type: 'special',
    text: t(translationString),
  };
});

each(specialMounts, (translationString, key) => {
  mountInfo[key] = {
    key,
    type: 'special',
    text: t(translationString),
  };
});

module.exports = {
  dropPets,
  premiumPets,
  questPets,
  wackyPets,
  dropMounts,
  questMounts,
  premiumMounts,
  specialPets,
  specialMounts,
  petInfo,
  mountInfo,
};
