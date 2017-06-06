import content from '../content/index';
import i18n from '../i18n';
import handleTwoHanded from '../fns/handleTwoHanded';
import {
  NotFound,
  BadRequest,
} from '../libs/errors';
import get from 'lodash/get';

module.exports = function equip (user, req = {}) {
  // Being type a parameter followed by another parameter
  // when using the API it must be passes specifically in the URL, it's won't default to equipped
  let type = get(req, 'params.type', 'equipped');
  let key = get(req, 'params.key');

  if (!key || !type) throw new BadRequest(i18n.t('missingTypeKeyEquip', req.language));
  if (['mount', 'pet', 'costume', 'equipped'].indexOf(type) === -1) {
    throw new BadRequest(i18n.t('invalidTypeEquip', req.language));
  }

  let message;

  switch (type) {
    case 'mount': {
      if (!user.items.mounts[key]) {
        throw new NotFound(i18n.t('mountNotOwned', req.language));
      }

      user.items.currentMount = user.items.currentMount === key ? '' : key;
      break;
    }
    case 'pet': {
      if (!user.items.pets[key]) {
        throw new NotFound(i18n.t('petNotOwned', req.language));
      }

      user.items.currentPet = user.items.currentPet === key ? '' : key;
      break;
    }
    case 'costume':
    case 'equipped': {
      if (!user.items.gear.owned[key]) {
        throw new NotFound(i18n.t('gearNotOwned', req.language));
      }

      let item = content.gear.flat[key];

      if (user.items.gear[type][item.type] === key) {
        user.items.gear[type] = Object.assign(
          {},
          user.items.gear[type].toObject ? user.items.gear[type].toObject() : user.items.gear[type],
          {[item.type]: `${item.type}_base_0`}
        );
        message = i18n.t('messageUnEquipped', {
          itemText: item.text(req.language),
        }, req.language);
      } else {
        user.items.gear[type] = Object.assign(
          {},
          user.items.gear[type].toObject ? user.items.gear[type].toObject() : user.items.gear[type],
          {[item.type]: item.key}
        );
        message = handleTwoHanded(user, item, type, req);
      }
      break;
    }
  }

  let res = [user.items];
  if (message) res.push(message);
  return res;
};
