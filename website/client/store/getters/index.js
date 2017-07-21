import { flattenAndNamespace } from 'client/libs/store/helpers/internals';
import * as user from './user';
import * as tasks from './tasks';
import * as party from './party';
import * as members from './members';

// Getters should be named as 'getterName' and can be accessed as 'namespace:getterName'
// Example: gems in user.js -> 'user:gems'

const getters = flattenAndNamespace({
  user,
  tasks,
  party,
  members,
});

export default getters;
