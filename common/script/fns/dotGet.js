import _ from 'lodash';

// TODO remove completely, use _.get

module.exports = function dotGet (user, path) {
  return _.get(user, path);
};
