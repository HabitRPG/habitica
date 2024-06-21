import forOwn from 'lodash/forOwn';
import t from '../translation';

export default function prefillAppearances (obj) {
  forOwn(obj, (value, key) => {
    value.key = key;
    if (!value.price) {
      value.price = 0;
    }
    if (!value.text) {
      value.text = t(key);
    }
  });
  return obj;
}
