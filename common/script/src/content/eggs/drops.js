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

let eggs = generateEggs(DROP_EGGS, {type: 'drop', canBuy: true});

export default eggs;
