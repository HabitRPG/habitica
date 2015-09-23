import {keys, reduce} from 'lodash';
import mystery from './mystery-sets';

function timeTravelerStore(owned) {
  var ownedKeys = keys((typeof owned.toObject === "function" ? owned.toObject() : void 0) || owned);
  return reduce(mystery, (m, v, k) => {
    if (k === 'wondercon' || ~ownedKeys.indexOf(v.items[0].key)) {
      return m;
    }
    m[k] = v;
    return m;
  }, {});
};

export default timeTravelerStore;
