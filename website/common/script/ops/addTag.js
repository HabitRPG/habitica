import get from 'lodash/get';
import uuid from '../libs/uuid';

// TODO used only in client, move there?

export default function addTag (user, req = {}) {
  if (!user.tags) {
    user.tags = [];
  }

  user.tags.push({
    name: req.body.name,
    id: get(req, 'body.id') || uuid(),
  });

  return user.tags;
}
