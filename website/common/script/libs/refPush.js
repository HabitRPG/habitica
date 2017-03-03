import isEmpty from 'lodash/isEmpty';
import maxBy from 'lodash/maxBy';
import values from 'lodash/values';
import uuid from './uuid';

/*
  Reflists are arrays, but stored as objects. Mongoose has a helluvatime working with arrays (the main problem for our
  syncing issues) - so the goal is to move away from arrays to objects, since mongoose can reference elements by ID
  no problem. To maintain sorting, we use these helper functions:
 */

module.exports = function refPush (reflist, item) {
  item.sort = isEmpty(reflist) ? 0 : maxBy(values(reflist), 'sort').sort + 1;

  if (!(item.id && !reflist[item.id])) {
    item.id = uuid();
  }

  reflist[item.id] = item;

  return reflist[item.id];
};
