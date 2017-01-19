import deepFreeze from 'deep-freeze';
import content from '../../common/script/content/index';

const state = {
  title: 'Habitica',
  user: null,
  tasks: null, // user tasks
  // content data, frozen to prevent Vue from modifying it
  // TODO apply freezing to the entire codebase (the server) and not only to the client side?
  // NOTE this is quite slow, taking 60-80ms on a fast computer, let's find an alternative
  // that being said, not freezing it is slow too because Vue's making the object reactive takes
  // about 70ms
  content: deepFreeze(content),
};

export default state;