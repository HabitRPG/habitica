import isBoolean from 'lodash/isBoolean';

export function ownsItem (item) {
  return user => item && isBoolean(user.items.gear.owned[item]);
}
