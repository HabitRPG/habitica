// Code taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
// and adapted
export default function deepFreeze (obj) {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);
  const propNamesLength = propNames.length;

  // Freeze properties before freezing self
  for (let i = 0; i < propNamesLength; i++) {
    const prop = obj[propNames[i]];

    // Freeze prop if it is an object
    if (typeof prop === 'object' && prop !== null) {
      deepFreeze(prop);
    }
  }

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}
