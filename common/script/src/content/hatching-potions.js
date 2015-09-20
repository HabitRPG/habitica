import {each, defaults} from 'lodash';
import t from './helpers/translator';

let hatchingPotions = {
  Base: {
    value: 2,
  },
  White: {
    value: 2,
  },
  Desert: {
    value: 2,
  },
  Red: {
    value: 3,
  },
  Shade: {
    value: 3,
  },
  Skeleton: {
    value: 3,
  },
  Zombie: {
    value: 4,
  },
  CottonCandyPink: {
    value: 4,
  },
  CottonCandyBlue: {
    value: 4,
  },
  Golden: {
    value: 5,
  }
};

each(hatchingPotions, function(potion, key) {
  defaults(potion, {
    key: key,
    value: 2,
    text: t(`hatchingPotion${key}`),
    notes: t('hatchingPotionNotes', {
      potText: potion.text
    }),
  });
});

export default hatchingPotions;
