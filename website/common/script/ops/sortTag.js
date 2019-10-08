import get from 'lodash/get';
import { BadRequest } from '../libs/errors';

// TODO used only in client, move there?

export default function sortTag (user, req = {}) {
  const to = get(req, 'query.to');
  const fromParam = get(req, 'query.from');

  const invalidTo = !to && to !== 0;
  const invalidFrom = !fromParam && fromParam !== 0;

  if (invalidTo || invalidFrom) {
    throw new BadRequest('?to=__&from=__ are required');
  }

  user.tags.splice(to, 0, user.tags.splice(fromParam, 1)[0]);
  return user.tags;
}
