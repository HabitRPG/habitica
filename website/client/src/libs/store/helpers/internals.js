/* Flatten multiple objects into a single, namespaced object.

Example:

  getters
    user
      gems
      tasks
      ...
    tasks
      todos
      dailys
      ...

  Result:
    getters
      user:gems
      user:tasks
      tasks:todos
      tasks:dailys
*/
export function flattenAndNamespace (namespaces) { // eslint-disable-line import/prefer-default-export, max-len
  const result = {};

  Object.keys(namespaces).forEach(namespace => {
    Object.keys(namespaces[namespace]).forEach(itemName => {
      result[`${namespace}:${itemName}`] = namespaces[namespace][itemName];
    });
  });

  return result;
}
