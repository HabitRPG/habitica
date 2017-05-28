import { flattenAndNamespace } from 'client/libs/store/helpers/internals';

import * as common from './common';
import * as user from './user';
import * as tasks from './tasks';

// Actions should be named as 'actionName' and can be accessed as 'namespace:actionName'
// Example: fetch in user.js -> 'user:fetch'

const actions = flattenAndNamespace({
  common,
  user,
  tasks,
});

export default actions;