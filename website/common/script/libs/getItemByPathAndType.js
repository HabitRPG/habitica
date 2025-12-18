import get from 'lodash/get';
import content from '../content/index';

export default function getItemByPathAndType (type, path) {
  let item;
  if (type === 'appearance') {
    item = get(content, `appearance.${path}`);
  } else {
    item = get(content, path);
  }

  if (type === 'timeTravelersStable') {
    const [, animalType, key] = path.split('.');

    item = {
      key,
      type: animalType,
    };
  }

  return item;
}
