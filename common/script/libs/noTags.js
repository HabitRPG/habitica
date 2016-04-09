import _ from 'lodash';

/*
are any tags active?
 */

// TODO move to client

module.exports = function(tags) {
  return _.isEmpty(tags) || _.isEmpty(_.filter(tags, function(t) {
    return t;
  }));
};
