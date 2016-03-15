import { each, isBoolean } from 'lodash';

export function ownsItem (item) {
  return (user) => {
    return item && isBoolean(user.items.gear.owned[item]);
  };
}

export function addSetProperty (setName, collection) {
  each(collection, (itemType) => {
    each(itemType, (item, key) => {
      item.set = `${setName}-${key}`;
    });
  });
}
