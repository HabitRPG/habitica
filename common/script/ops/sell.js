import content from '../content/index';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb) {
  var key, ref, type;
  ref = req.params, key = ref.key, type = ref.type;
  if (type !== 'eggs' && type !== 'hatchingPotions' && type !== 'food') {
    return typeof cb === "function" ? cb({
      code: 404,
      message: ":type not found. Must bes in [eggs, hatchingPotions, food]"
    }) : void 0;
  }
  if (!user.items[type][key]) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: ":key not found for user.items." + type
    }) : void 0;
  }
  user.items[type][key]--;
  user.stats.gp += content[type][key].value;
  return typeof cb === "function" ? cb(null, _.pick(user, splitWhitespace('stats items'))) : void 0;
};
