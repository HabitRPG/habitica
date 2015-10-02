import {generateEggs} from '../helpers';

const DROP_EGGS = [
  'Wolf',
  'TigerCub',
  'PandaCub',
  'LionCub',
  'Fox',
  'FlyingPig',
  'Dragon',
  'Cactus',
  'BearCub',
];

let eggDefaults = {
  type: 'drop',
  canBuy: () => {
    return () => {
      return true;
    };
  },
};

let eggs = generateEggs(DROP_EGGS, eggDefaults);

export default eggs;
