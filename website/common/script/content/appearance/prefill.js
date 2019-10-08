import forOwn from 'lodash/forOwn';

export default function prefillAppearances (obj) {
  forOwn(obj, (value, key) => {
    value.key = key;
    if (!value.price) {
      value.price = 0;
    }
  });
  return obj;
}
