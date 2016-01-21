import {forOwn} from 'lodash';

export default function addKeys (obj) {
  forOwn(obj, function addKey (value, key) {
    value.key = key;
  });
  return obj;
}
