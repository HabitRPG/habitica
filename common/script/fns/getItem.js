import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, type) {
  var item;
  item = content.gear.flat[user.items.gear.equipped[type]];
  if (!item) {
    return content.gear.flat[type + "_base_0"];
  }
  return item;
};
