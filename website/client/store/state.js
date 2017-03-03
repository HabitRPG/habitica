import deepFreeze from '../libs/deepFreeze';
import content from '../../common/script/content/index';

const state = {
  title: 'Habitica',
  user: null,
  tasks: null, // user tasks
  // content data, frozen to prevent Vue from modifying it since it's static and never changes
  // TODO apply freezing to the entire codebase (the server) and not only to the client side?
  // NOTE this takes about 10-15ms on a fast computer
  content: deepFreeze(content),
};

export default state;