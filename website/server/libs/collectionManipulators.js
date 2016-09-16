import {
  findIndex,
  isPlainObject,
} from 'lodash';

export function removeFromArray (array, element) {
  let elementIndex;

  if (isPlainObject(element)) {
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
