import {generateEggs} from '../helpers';

const QUEST_EGGS = [
  'Gryphon',
  'Hedgehog',
  'Deer',
  'Egg',
  'Rat',
  'Octopus',
  'Seahorse',
  'Parrot',
  'Rooster',
  'Spider',
  'Owl',
  'Penguin',
  'TRex',
  'Rock',
  'Bunny',
  'Slime',
  'Sheep',
  'Cuttlefish',
  'Whale',
  'Cheetah',
  'Horse',
];

let eggs = generateEggs(QUEST_EGGS, {type: 'quest', canBuy: false});

export default eggs;
