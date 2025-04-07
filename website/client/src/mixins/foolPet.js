import includes from 'lodash/includes';

export default {
  methods: {
    foolPet (pet, prank) {
      const SPECIAL_PETS = [
        'Bear-Veteran',
        'BearCub-Polar',
        'Cactus-Veteran',
        'Dragon-Hydra',
        'Dragon-Veteran',
        'Fox-Veteran',
        'Gryphatrice-Jubilant',
        'Gryphon-Gryphatrice',
        'Gryphon-RoyalPurple',
        'Hippogriff-Hopeful',
        'Jackalope-RoyalPurple',
        'JackOLantern-Base',
        'JackOLantern-Ghost',
        'JackOLantern-Glow',
        'JackOLantern-RoyalPurple',
        'Lion-Veteran',
        'MagicalBee-Base',
        'Mammoth-Base',
        'MantisShrimp-Base',
        'Orca-Base',
        'Phoenix-Base',
        'Tiger-Veteran',
        'Turkey-Base',
        'Turkey-Gilded',
        'Wolf-Cerberus',
        'Wolf-Veteran',
      ];
      const BASE_PETS = [
        'BearCub',
        'Cactus',
        'Dragon',
        'FlyingPig',
        'Fox',
        'LionCub',
        'PandaCub',
        'TigerCub',
        'Wolf',
      ];
      if (!pet) return `Pet-TigerCub-${prank}`;
      if (SPECIAL_PETS.indexOf(pet) !== -1) {
        return `Pet-Dragon-${prank}`;
      }
      const species = pet.slice(0, pet.indexOf('-'));
      if (includes(BASE_PETS, species)) {
        return `Pet-${species}-${prank}`;
      }
      return `Pet-BearCub-${prank}`;
    },
  },
};
