import prefill from '../prefill';
import sets from '../sets';
import t from '../../translation';

export default prefill({
  0: { text: t('none') },
  1: { text: t('ponytail') },
  2: { text: t('doublePonytail'), price: 2, set: sets.baseHair1 },
  3: { text: t('braid') },
  4: { text: t('doubleBraid'), price: 2, set: sets.baseHair1 },
  5: { text: t('wavyLong'), price: 2, set: sets.baseHair1 },
  6: { text: t('wavyShort'), price: 2, set: sets.baseHair1 },
  7: { text: t('straightLong'), price: 2, set: sets.baseHair1 },
  8: { text: t('straightShort'), price: 2, set: sets.baseHair1 },
  9: { text: t('highPonytailLeft'), price: 2, set: sets.baseHair2 },
  10: { text: t('leftBun'), price: 2, set: sets.baseHair2 },
  11: { text: t('highPonytailRight'), price: 2, set: sets.baseHair2 },
  12: { text: t('rightBun'), price: 2, set: sets.baseHair2 },
  13: { text: t('doubleHighPonytail'), price: 2, set: sets.baseHair2 },
  14: { text: t('doubleBun'), price: 2, set: sets.baseHair2 },
  15: { text: t('updo'), price: 2, set: sets.baseHair3 },
  16: { text: t('curlyLong'), price: 2, set: sets.baseHair3 },
  17: { text: t('curlyShort'), price: 2, set: sets.baseHair3 },
  18: { text: t('messy'), price: 2, set: sets.baseHair3 },
  19: { text: t('mohawk'), price: 2, set: sets.baseHair3 },
  20: { text: t('fauxhawk'), price: 2, set: sets.baseHair3 },
});
