import { flattenAndNamespace } from '../helpers/internals';
import * as tasks from './tasks';
import * as user from './user';

// Actions should be named as 'actionName' and can be accessed as 'namespace.actionName'
// Example: fetch in user.js -> 'user.fetch'

const actions = flattenAndNamespace({
  user,
  tasks,
});

export default actions;