import {each, defaults} from 'lodash';
import t from '../helpers/translator';

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

let eggs = { };

each(DROP_EGGS, (pet) => {
  eggs[pet] = {
    text: t(`dropEgg${pet}Text`),
    mountText: t(`dropEgg${pet}MountText`),
    adjective: t(`dropEgg${pet}Adjective`),
  }
});

each(eggs, (egg, key) => {
  return defaults(egg, {
    canBuy: true,
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
  });
});

export default eggs;
