import i18n from '../i18n';
import content from '../content/index';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';

module.exports = function(user, req, cb) {
  var base, item, key, message;
  key = req.params.key;
  item = content.special[key];
  if (user.stats.gp < item.value) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageNotEnoughGold', req.language)
    }) : void 0;
  }
  user.stats.gp -= item.value;
  if ((base = user.items.special)[key] == null) {
    base[key] = 0;
  }
  user.items.special[key]++;
  if (typeof user.markModified === "function") {
    user.markModified('items.special');
  }
  message = i18n.t('messageBought', {
    itemText: item.text(req.language)
  }, req.language);
  return typeof cb === "function" ? cb({
    code: 200,
    message: message
  }, _.pick(user, splitWhitespace('items stats'))) : void 0;
};
