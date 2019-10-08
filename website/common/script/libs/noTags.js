import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

/*
are any tags active?
 */

// TODO move to client

export default function noTags (tags) {
  return isEmpty(tags) || isEmpty(filter(tags, t => t));
}
