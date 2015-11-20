import {
  isEmpty,
  max,
} from 'lodash';

import uuid from 'uuid';

export function $w (s) {
  return s.split(' ');
}

/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use these helper functions:
 */

export function refPush (reflist, item) {
  item.sort = isEmpty(reflist) ? 0 : max(reflist, 'sort').sort + 1;
  if (!(item.id && !reflist[item.id])) {
    item.id = uuid.v4();
  }
  reflist[item.id] = item;
  return reflist[item.id];
}
