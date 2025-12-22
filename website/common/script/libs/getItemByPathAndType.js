import get from 'lodash/get';
import content from '../content/index';

export default function getItemByPathAndType (type, path) {
  let item;
  if ([
    'haircolor',
    'hairbase',
    'hairmustache',
    'hairbeard',
    'shirt',
    'skin',
  ].indexOf(type) !== -1) {
    item = get(content, `appearances.${path}`);
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
