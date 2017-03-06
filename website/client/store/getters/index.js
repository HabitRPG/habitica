import { flattenAndNamespace } from '../helpers/internals';
import * as user from './user';

// Getters should be named as 'getterName' and can be accessed as 'namespace:getterName'
// Example: gems in user.js -> 'user:gems'

const getters = flattenAndNamespace({
  user,
});

export default getters;