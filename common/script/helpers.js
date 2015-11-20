import {
  isEmpty,
  max,
} from 'lodash';

export function $w (s) {
  return s.split(' ');
}

export function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function genID (c) {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : r & 0x3 | 0x8;

    return v.toString(16);
  });
}

/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use these helper functions:
 */

export function refPush (reflist, item) {
  item.sort = isEmpty(reflist) ? 0 : max(reflist, 'sort').sort + 1;
  if (!(item.id && !reflist[item.id])) {
    item.id = uuid();
  }
  reflist[item.id] = item;
  return reflist[item.id];
}
