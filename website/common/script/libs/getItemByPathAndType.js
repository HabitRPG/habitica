import content from '../content/index';
import get from 'lodash/get';

module.exports = function getItemByPathAndType (type, path) {
  let item = get(content, path);

  if (type === 'timeTravelersStable') {
    let [, animalType, key] = path.split('.');

    item = {
      key,
      type: animalType,
    };
  }

  return item;
};
