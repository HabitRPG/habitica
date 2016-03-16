import content from '../content/index';
import _ from 'lodash';

module.exports = function(user) {
  var base, owned;
  owned = typeof window !== "undefined" && window !== null ? user.items.gear.owned : user.items.gear.owned.toObject();
  if ((base = user.achievements).ultimateGearSets == null) {
    base.ultimateGearSets = {
      healer: false,
      wizard: false,
      rogue: false,
      warrior: false
    };
  }
  content.classes.forEach(function(klass) {
    if (user.achievements.ultimateGearSets[klass] !== true) {
      return user.achievements.ultimateGearSets[klass] = _.reduce(['armor', 'shield', 'head', 'weapon'], function(soFarGood, type) {
        var found;
        found = _.find(content.gear.tree[type][klass], {
          last: true
        });
        return soFarGood && (!found || owned[found.key] === true);
      }, true);
    }
  });
  if (typeof user.markModified === "function") {
    user.markModified('achievements.ultimateGearSets');
  }
  if (_.contains(user.achievements.ultimateGearSets, true) && user.flags.armoireEnabled !== true) {
    user.flags.armoireEnabled = true;
    return typeof user.markModified === "function" ? user.markModified('flags') : void 0;
  }
};
