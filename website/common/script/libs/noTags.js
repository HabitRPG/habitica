import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

/*
are any tags active?
 */

// TODO move to client

module.exports = function noTags (tags) {
  return _.isEmpty(tags) || _.isEmpty(_.filter(tags, (t) => {
    return t;
  }));
};
