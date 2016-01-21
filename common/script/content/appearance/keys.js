import {forOwn} from 'lodash';

export default function(obj) {
  forOwn(obj, function(value, key) {
    value.key = key;
  });
  return obj;
}
