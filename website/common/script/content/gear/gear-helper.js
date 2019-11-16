import isBoolean from 'lodash/isBoolean';

export function ownsItem (item) { // eslint-disable-line import/prefer-default-export
  return user => item && isBoolean(user.items.gear.owned[item]);
}
