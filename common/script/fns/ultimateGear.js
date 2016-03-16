import content from '../content/index';
import _ from 'lodash';

module.exports = function ultimateGear (user) {
  let owned = window ? user.items.gear.owned : user.items.gear.owned.toObject();

  if (!user.achievements.ultimateGearSets) {
    user.achievements.ultimateGearSets = {
      healer: false,
      wizard: false,
      rogue: false,
      warrior: false,
    };
  }

  content.classes.forEach((klass) => {
    if (user.achievements.ultimateGearSets[klass] !== true) {
      user.achievements.ultimateGearSets[klass] = _.reduce(['armor', 'shield', 'head', 'weapon'], (soFarGood, type) => {
        let found = _.find(content.gear.tree[type][klass], {
          last: true,
        });
        return soFarGood && (!found || owned[found.key] === true);
      }, true);
    }
  });

  // TODO
  if (user.markModified) user.markModified('achievements.ultimateGearSets');

  if (_.contains(user.achievements.ultimateGearSets, true) && user.flags.armoireEnabled !== true) {
    user.flags.armoireEnabled = true;
  }

  return;
};
