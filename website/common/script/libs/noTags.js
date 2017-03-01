import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

/*
are any tags active?
 */

// TODO move to client

module.exports = function noTags (tags) {
  return isEmpty(tags) || isEmpty(filter(tags, (t) => {
    return t;
  }));
};
