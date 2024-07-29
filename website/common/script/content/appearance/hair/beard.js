import prefill from '../prefill';
import sets from '../sets';
import t from '../../translation';

export default prefill({
  0: { text: t('none') },
  1: { text: t('goatee'), price: 2, set: sets.facialHair },
  2: { text: t('shortBeard'), price: 2, set: sets.facialHair },
  3: { text: t('longBeard'), price: 2, set: sets.facialHair },
});
