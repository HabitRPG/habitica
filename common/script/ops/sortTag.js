import { BadRequest } from '../libs/errors';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function sortTag (user, req = {}) {
  let to = _.get(req, 'query.to');
  let fromParam = _.get(req, 'query.from');

  if (!to || !fromParam) {
    throw new BadRequest('?to=__&from=__ are required');
  }

  user.tags.splice(to, 0, user.tags.splice(fromParam, 1)[0]);
  return user.tags;
};
