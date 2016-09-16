import _ from 'lodash';

module.exports = function deletePM (user, req = {}) {
  delete user.inbox.messages[_.get(req, 'params.id')];
  user.markModified(`inbox.messages.${req.params.id}`);
  return [
    user.inbox.messages,
  ];
};
