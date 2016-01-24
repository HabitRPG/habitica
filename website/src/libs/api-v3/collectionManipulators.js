import { findIndex } from 'lodash';

export function removeElement (array, element) {
  let elementIndex;

  if (typeof element === 'object') {
    elementIndex = findIndex(array, element);
  } else {
    elementIndex = array.indexOf(element);
  }

  if (elementIndex !== -1) {
    let removedElement = array[elementIndex];
    array.splice(elementIndex, 1);
    return removedElement;
  }

  return false;
}
