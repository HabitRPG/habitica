import { findIndex } from 'lodash';

export function removeElementFromArray (array, element) {
  let elementIndex;

  if (typeof element === 'object') {
    elementIndex = findIndex(array, element);
  } else {
    elementIndex = array.indexOf(element);
  }

  if (elementIndex !== -1) {
    let removedElement = array[elementIndex];
    // Splice must be used so mongoose picks up the change
    array.splice(elementIndex, 1);
    return removedElement;
  }

  return false;
}
