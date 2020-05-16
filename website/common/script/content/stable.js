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

const specialPets = {
  'Wolf-Veteran': {
    translationString: 'veteranWolf',
    canFind: false,
  },
  'Wolf-Cerberus': {
    translationString: 'cerberusPup',
    canFind: false,
  },
  'Dragon-Hydra': {
    translationString: 'hydra',
    canFind: true,
  },
  'Turkey-Base': {
    translationString: 'turkey',
    canFind: false,
  },
  'BearCub-Polar': {
    translationString: 'polarBearPup',
    canFind: true,
  },
  'MantisShrimp-Base': {
    translationString: 'mantisShrimp',
    canFind: true,
  },
  'JackOLantern-Base': {
    translationString: 'jackolantern',
    canFind: false,
  },
  'Mammoth-Base': {
    translationString: 'mammoth',
    canFind: true,
  },
  'Tiger-Veteran': {
    translationString: 'veteranTiger',
    canFind: false,
  },
  'Phoenix-Base': {
    translationString: 'phoenix',
    canFind: true,
  },
  'Turkey-Gilded': {
    translationString: 'gildedTurkey',
    canFind: true,
  },
  'MagicalBee-Base': {
    translationString: 'magicalBee',
    canFind: true,
  },
  'Lion-Veteran': {
    translationString: 'veteranLion',
    canFind: true,
  },
  'Gryphon-RoyalPurple': {
    translationString: 'royalPurpleGryphon',
    canFind: false,
  },
  'JackOLantern-Ghost': {
    translationString: 'ghostJackolantern',
    canFind: false,
  },
  'Jackalope-RoyalPurple': {
    translationString: 'royalPurpleJackalope',
    canFind: true,
  },
  'Orca-Base': {
    translationString: 'orca',
    canFind: false,
  },
  'Bear-Veteran': {
    translationString: 'veteranBear',
    canFind: false,
  },
  'Hippogriff-Hopeful': {
    translationString: 'hopefulHippogriffPet',
    canFind: true,
  },
  'Fox-Veteran': {
    translationString: 'veteranFox',
    canFind: false,
  },
  'JackOLantern-Glow': {
    translationString: 'glowJackolantern',
    canFind: false,
  },
  'Gryphon-Gryphatrice': {
    translationString: 'gryphatrice',
    canFind: false,
  },
};

const specialMounts = {
  'BearCub-Polar': {
    translationString: 'polarBear',
    canFind: false,
  },
  'LionCub-Ethereal': {
    translationString: 'etherealLion',
    canFind: true,
  },
  'MantisShrimp-Base': {
    translationString: 'mantisShrimp',
    canFind: true,
  },
  'Turkey-Base': {
    translationString: 'turkey',
    canFind: false,
  },
  'Mammoth-Base': {
    translationString: 'mammoth',
    canFind: true,
  },
  'Orca-Base': {
    translationString: 'orca',
    canFind: false,
  },
  'Gryphon-RoyalPurple': {
    translationString: 'royalPurpleGryphon',
    canFind: false,
  },
  'Phoenix-Base': {
    translationString: 'phoenix',
    canFind: true,
  },
  'JackOLantern-Base': {
    translationString: 'jackolantern',
    canFind: false,
  },
  'MagicalBee-Base': {
    translationString: 'magicalBee',
    canFind: true,
  },
  'Turkey-Gilded': {
    translationString: 'gildedTurkey',
    canFind: false,
  },
  'Jackalope-RoyalPurple': {
    translationString: 'royalPurpleJackalope',
    canFind: true,
  },
  'Aether-Invisible': {
    translationString: 'invisibleAether',
    canFind: true,
  },
  'JackOLantern-Ghost': {
    translationString: 'ghostJackolantern',
    canFind: false,
  },
  'Hippogriff-Hopeful': {
    translationString: 'hopefulHippogriffMount',
    canFind: true,
  },
  'Gryphon-Gryphatrice': {
    translationString: 'gryphatrice',
    canFind: false,
  },
  'JackOLantern-Glow': {
    translationString: 'glowJackolantern',
    canFind: true,
  },
};

each(specialPets, (entry, key) => {
  petInfo[key] = {
    key,
    type: 'special',
    text: t(entry.translationString),
  };
});

each(specialMounts, (entry, key) => {
  mountInfo[key] = {
    key,
    type: 'special',
    text: t(entry.translationString),
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
