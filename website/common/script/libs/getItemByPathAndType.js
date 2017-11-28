import content from '../content/index';
import get from 'lodash/get';
import getItemInfo from './getItemInfo';

module.exports = function getItemByPathAndType (type, path) {
  let item = get(content, path);

  console.info('type', type, path);
  if (type === 'timeTravelersStable') {
    let [_, animalType, key] = path.split('.');


    item = {
      key,
      type: animalType
    };
  }

  return item;
}
