import uuid from '../libs/uuid';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function addTag (user, req = {}) {
  if (!user.tags) {
    user.tags = [];
  }

  user.tags.push({
    name: req.body.name,
    id: _.get(req, 'body.id') || uuid(),
  });

  return user.tags;
};
