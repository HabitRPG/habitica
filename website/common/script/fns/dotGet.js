import _ from 'lodash';

// TODO remove completely, use _.get, only used in client

module.exports = function dotGet (user, path) {
  return _.get(user, path);
};
