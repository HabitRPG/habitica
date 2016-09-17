import { isBoolean } from 'lodash';

export function ownsItem (item) {
  return (user) => {
    return item && isBoolean(user.items.gear.owned[item]);
  };
}
