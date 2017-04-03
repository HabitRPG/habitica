import isBoolean from 'lodash/isBoolean';

export function ownsItem (item) {
  return (user) => {
    return item && isBoolean(user.items.gear.owned[item]);
  };
}
