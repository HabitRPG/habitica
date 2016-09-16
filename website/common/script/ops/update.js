import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function updateUser (user, req = {}) {
  _.each(req.body, (val, key) => {
    _.set(user, key, val);
  });

  return user;
};
