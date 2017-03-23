import { flattenAndNamespace } from 'client/libs/store/helpers/internals';
import * as user from './user';
import * as tasks from './tasks';

// Getters should be named as 'getterName' and can be accessed as 'namespace:getterName'
// Example: gems in user.js -> 'user:gems'

const getters = flattenAndNamespace({
  user,
  tasks,
});

export default getters;