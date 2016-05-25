import _ from 'lodash';

/*
are any tags active?
 */

// TODO move to client

module.exports = function noTags (tags) {
  return _.isEmpty(tags) || _.isEmpty(_.filter(tags, (t) => {
    return t;
  }));
};
