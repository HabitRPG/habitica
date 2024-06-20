import each from 'lodash/each';
import moment from 'moment';
import { EVENTS } from './constants/events';
import allEggs from './eggs';
import allPotions from './hatching-potions';
import t from './translation';
import memoize from '../fns/datedMemoize';

function constructSet (type, eggs, potions, petInfo, mountInfo, hasMounts = true) {
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
      pets[key] = true;

      if (hasMounts) {
        mountInfo[key] = getAnimalData(t('mountName', {
          potion: potion.text,
          mount: egg.mountText,
        }));
        mounts[key] = true;
      }
    });
  });

  if (hasMounts) {
    return [pets, mounts];
  }
  return pets;
}

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
    'Cactus-Veteran': false,

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
  'Cactus-Veteran': 'veteranCactus',
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

function buildInfo () {
  const petInfo = {};
  const mountInfo = {};

  const [dropPets, dropMounts] = constructSet('drop', allEggs.drops, allPotions.drops, petInfo, mountInfo);
  const [premiumPets, premiumMounts] = constructSet('premium', allEggs.drops, allPotions.premium, petInfo, mountInfo);
  const [questPets, questMounts] = constructSet('quest', allEggs.quests, allPotions.drops, petInfo, mountInfo);
  const wackyPets = constructSet('wacky', allEggs.drops, allPotions.wacky, petInfo, mountInfo, false);

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

  return {
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
}

const memoizedBuildInfo = memoize(buildInfo);

export default {
  get dropPets () {
    return memoizedBuildInfo().dropPets;
  },
  get premiumPets () {
    return memoizedBuildInfo().premiumPets;
  },
  get questPets () {
    return memoizedBuildInfo().questPets;
  },
  get wackyPets () {
    return memoizedBuildInfo().wackyPets;
  },
  get dropMounts () {
    return memoizedBuildInfo().dropMounts;
  },
  get questMounts () {
    return memoizedBuildInfo().questMounts;
  },
  get premiumMounts () {
    return memoizedBuildInfo().premiumMounts;
  },
  get petInfo () {
    return memoizedBuildInfo().petInfo;
  },
  get mountInfo () {
    return memoizedBuildInfo().mountInfo;
  },
  specialPets,
  specialMounts,
};
