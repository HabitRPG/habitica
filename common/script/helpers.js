import {
  isEmpty,
  max,
  reduce,
} from 'lodash';

import uuid from 'uuid';

export function $w (s) {
  return s.split(' ');
}

/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use this helper function:
 */

export function refPush (reflist, item) {
  item.sort = isEmpty(reflist) ? 0 : max(reflist, 'sort').sort + 1;
  if (!(item.id && !reflist[item.id])) {
    item.id = uuid.v4();
  }
  reflist[item.id] = item;
  return reflist[item.id];
}

/*
  Counts truthy values in an object.
  If truthy (true, 8, -3, 'string', { foo: 'bar'}, ['array'], {}, []), 1 gets added to the total.
  If not truthy (false, 0, '', null), 0 gets added.
 */

export function countExists (items) {
  return reduce(items, (total, value) => {
    let count = value ? 1 : 0;

    return total + count;
  }, 0);
}
