import each from 'lodash/each';
import moment from 'moment';
import { EVENTS } from './constants/events';
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

const petInfo = {};
const mountInfo = {};

function constructSet (type, eggs, potions) {
  const pets = {};
  const mounts = {};

  each(eggs, egg => {
    each(potions, potion => {
      const key = `${egg.key}-${potion.key}`;

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
  const pets = {};

  each(eggs, egg => {
    each(potions, potion => {
      const key = `${egg.key}-${potion.key}`;

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

const [dropPets, dropMounts] = constructSet('drop', dropEggs, dropPotions);
const [premiumPets, premiumMounts] = constructSet('premium', dropEggs, premiumPotions);
const [questPets, questMounts] = constructSet('quest', questEggs, dropPotions);
const wackyPets = constructPetOnlySet('wacky', dropEggs, wackyPotions);

const canFindSpecial = {
  pets: {
    // Veteran Pet Ladder - awarded on major updates
    // https://habitica.fandom.com/wiki/Event_Item_Sequences#Veteran_Pets
    'Wolf-Veteran': false,
    'Tiger-Veteran': false,
    'Lion-Veteran': false,
    'Bear-Veteran': false,
    'Fox-Veteran': false,
    'Dragon-Veteran': false,

    // Thanksgiving pet ladder
    'Turkey-Base': false,
    'Turkey-Gilded': false,
    // Habitoween pet ladder
    'JackOLantern-Base': false,
    'JackOLantern-Glow': false,
    'JackOLantern-Ghost': false,
    'JackOLantern-RoyalPurple': false,
    // Naming Day
    'Gryphon-RoyalPurple': false,
    // Summer Splash Orca
    'Orca-Base': false,

    // Quest pets
    'BearCub-Polar': true, // evilsanta
    // World Quest Pets - Found in Time Travel Stable
    'MantisShrimp-Base': true, // dilatory
    'Mammoth-Base': true, // stressbeast
    'Phoenix-Base': true, // burnout
    'MagicalBee-Base': true, // bewilder
    'Hippogriff-Hopeful': true, // dysheartener

    // Contributor/Backer pets
    'Dragon-Hydra': true, // Contributor level 6
    'Jackalope-RoyalPurple': true, // subscription
    'Wolf-Cerberus': false, // Pet once granted to backers
    'Gryphon-Gryphatrice': false, // Pet once granted to kickstarter

    // Birthday Pet
    'Gryphatrice-Jubilant': false,
  },
  mounts: {
    // Thanksgiving pet ladder
    'Turkey-Base': false,
    'Turkey-Gilded': false,

    // Habitoween pet ladder
    'JackOLantern-Base': false,
    'JackOLantern-Glow': false,
    'JackOLantern-Ghost': false,
    'JackOLantern-RoyalPurple': false,
    // Naming Day
    'Gryphon-RoyalPurple': false,
    // Summer Splash Orca
    'Orca-Base': false,

    // Quest mounts
    'BearCub-Polar': true, // evilsanta
    'Aether-Invisible': true, // lostMasterclasser4
    // World Quest Pets - Found in Time Travel
    'MantisShrimp-Base': true, // dilatory
    'Mammoth-Base': true, // stressbeast
    'Phoenix-Base': true, // burnout
    'MagicalBee-Base': true,
    'Hippogriff-Hopeful': true,

    // Contributor/Backer pets
    'LionCub-Ethereal': false, // Backer tier 90
    'Jackalope-RoyalPurple': true, // subscription
    'Gryphon-Gryphatrice': false, // Pet once granted to kickstarter
  },
};

const specialPets = {
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
  'Gryphon-Gryphatrice': 'gryphatrice',
  'Gryphatrice-Jubilant': 'jubilantGryphatrice',
  'JackOLantern-RoyalPurple': 'royalPurpleJackolantern',
  'Dragon-Veteran': 'veteranDragon',
};

const specialMounts = {
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
  'Gryphon-Gryphatrice': 'gryphatrice',
  'JackOLantern-Glow': 'glowJackolantern',
  'JackOLantern-RoyalPurple': 'royalPurpleJackolantern',
};

each(specialPets, (translationString, key) => {
  petInfo[key] = {
    key,
    type: 'special',
    text: t(translationString),
    canFind: canFindSpecial.pets[key],
  };
});

Object.assign(petInfo['Gryphatrice-Jubilant'], {
  canBuy () {
    return moment().isBetween(EVENTS.birthday10.start, EVENTS.birthday10.end);
  },
  currency: 'gems',
  event: 'birthday10',
  value: 60,
  purchaseType: 'pets',
});

each(specialMounts, (translationString, key) => {
  mountInfo[key] = {
    key,
    type: 'special',
    text: t(translationString),
    canFind: canFindSpecial.mounts[key],
  };
});

export {
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
