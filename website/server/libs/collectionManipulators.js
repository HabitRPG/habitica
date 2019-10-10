import findIndex from 'lodash/findIndex';
import isPlainObject from 'lodash/isPlainObject';

export function removeFromArray (array, element) { // eslint-disable-line import/prefer-default-export, max-len
  let elementIndex;

  if (isPlainObject(element)) {
    elementIndex = findIndex(array, element);
  } else {
    elementIndex = array.indexOf(element);
  }

  if (elementIndex !== -1) {
    const removedElement = array[elementIndex];
    array.splice(elementIndex, 1);
    return removedElement;
  }

  return false;
}
