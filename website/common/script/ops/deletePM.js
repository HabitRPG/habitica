import get from 'lodash/get';

module.exports = function deletePM (user, req = {}) {
  delete user.inbox.messages[get(req, 'params.id')];
  if (user.markModified) user.markModified(`inbox.messages.${req.params.id}`);
  return [
    user.inbox.messages,
  ];
};
