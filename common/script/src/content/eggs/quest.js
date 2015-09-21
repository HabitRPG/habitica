import {each, defaults} from 'lodash';
import t from '../helpers/translator';

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

let eggs = { };

each(QUEST_EGGS, (pet) => {
  eggs[pet] = {
    text: t(`questEgg${pet}Text`),
    mountText: t(`questEgg${pet}MountText`),
    adjective: t(`questEgg${pet}Adjective`),
  }
});

each(eggs, (egg, key) => {
  return defaults(egg, {
    canBuy: false,
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
  });
});

export default eggs;
