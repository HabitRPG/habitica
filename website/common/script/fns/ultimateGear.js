import content from '../content/index';
import _ from 'lodash';

module.exports = function ultimateGear (user) {
  let owned = typeof window !== 'undefined' ? user.items.gear.owned : user.items.gear.owned.toObject();

  content.classes.forEach((klass) => {
    if (user.achievements.ultimateGearSets[klass] !== true) {
      user.achievements.ultimateGearSets[klass] = _.reduce(['armor', 'shield', 'head', 'weapon'], (soFarGood, type) => {
        let found = _.find(content.gear.tree[type][klass], {
          last: true,
        });
        return soFarGood && (!found || owned[found.key] === true);
      }, true);

      if (user.achievements.ultimateGearSets[klass] === true) {
        user.addNotification('ULTIMATE_GEAR_ACHIEVEMENT');
      }
    }
  });

  let ultimateGearSetValues;
  if (user.achievements.ultimateGearSets.toObject) {
    ultimateGearSetValues = Object.values(user.achievements.ultimateGearSets.toObject());
  } else {
    ultimateGearSetValues = Object.values(user.achievements.ultimateGearSets);
  }

  let hasFullSet = _.includes(ultimateGearSetValues, true);

  if (hasFullSet && user.flags.armoireEnabled !== true) {
    user.flags.armoireEnabled = true;
  }

  return;
};
