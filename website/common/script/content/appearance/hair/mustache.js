import prefill from '../prefill';
import sets from '../sets';
import t from '../../translation';

export default prefill({
  0: { text: t('none') },
  1: { text: t('smallMustache'), price: 2, set: sets.facialHair },
  2: { text: t('largeMustache'), price: 2, set: sets.facialHair },
});
