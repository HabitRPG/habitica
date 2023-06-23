import includes from 'lodash/includes';

export default {
  methods: {
    foolPet (pet) {
      const SPECIAL_PETS = [
        'Wolf-Veteran',
        'Wolf-Cerberus',
        'Dragon-Hydra',
        'Turkey-Base',
        'BearCub-Polar',
        'MantisShrimp-Base',
        'JackOLantern-Base',
        'Mammoth-Base',
        'Tiger-Veteran',
        'Phoenix-Base',
        'Turkey-Gilded',
        'MagicalBee-Base',
        'Lion-Veteran',
        'Gryphon-RoyalPurple',
        'JackOLantern-Ghost',
        'Jackalope-RoyalPurple',
        'Orca-Base',
        'Bear-Veteran',
        'Hippogriff-Hopeful',
        'Fox-Veteran',
        'JackOLantern-Glow',
        'Gryphon-Gryphatrice',
        'Gryphatrice-Jubilant',
        'JackOLantern-RoyalPurple',
      ];
      const BASE_PETS = [
        'Wolf',
        'TigerCub',
        'PandaCub',
        'LionCub',
        'Fox',
        'FlyingPig',
        'BearCub',
        'Dragon',
        'Cactus',
      ];
      if (!pet) return 'Pet-TigerCub-TeaShop';
      if (SPECIAL_PETS.indexOf(pet) !== -1) {
        return 'Pet-Dragon-TeaShop';
      }
      const species = pet.slice(0, pet.indexOf('-'));
      if (includes(BASE_PETS, species)) {
        return `Pet-${species}-TeaShop`;
      }
      return 'Pet-BearCub-TeaShop';
    },
  },
};
