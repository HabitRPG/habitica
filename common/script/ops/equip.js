import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb) {
  var item, key, message, ref, type;
  ref = [req.params.type || 'equipped', req.params.key], type = ref[0], key = ref[1];
  switch (type) {
    case 'mount':
      if (!user.items.mounts[key]) {
        return typeof cb === "function" ? cb({
          code: 404,
          message: ":You do not own this mount."
        }) : void 0;
      }
      user.items.currentMount = user.items.currentMount === key ? '' : key;
      break;
    case 'pet':
      if (!user.items.pets[key]) {
        return typeof cb === "function" ? cb({
          code: 404,
          message: ":You do not own this pet."
        }) : void 0;
      }
      user.items.currentPet = user.items.currentPet === key ? '' : key;
      break;
    case 'costume':
    case 'equipped':
      item = content.gear.flat[key];
      if (!user.items.gear.owned[key]) {
        return typeof cb === "function" ? cb({
          code: 404,
          message: ":You do not own this gear."
        }) : void 0;
      }
      if (user.items.gear[type][item.type] === key) {
        user.items.gear[type][item.type] = item.type + "_base_0";
        message = i18n.t('messageUnEquipped', {
          itemText: item.text(req.language)
        }, req.language);
      } else {
        user.items.gear[type][item.type] = item.key;
        message = user.fns.handleTwoHanded(item, type, req);
      }
      if (typeof user.markModified === "function") {
        user.markModified("items.gear." + type);
      }
  }
  return typeof cb === "function" ? cb((message ? {
    code: 200,
    message: message
  } : null), user.items) : void 0;
};
