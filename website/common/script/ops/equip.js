import get from 'lodash/get';
import content from '../content/index';
import i18n from '../i18n';
import handleTwoHanded from '../fns/handleTwoHanded';
import {
  NotFound,
  BadRequest,
} from '../libs/errors';
import errorMessage from '../libs/errorMessage';

export default function equip (user, req = {}) {
  // Being type a parameter followed by another parameter
  // when using the API it must be passes specifically in the URL, it's won't default to equipped
  const type = get(req, 'params.type', 'equipped');
  const key = get(req, 'params.key');

  if (!key || !type) throw new BadRequest(errorMessage('missingTypeKeyEquip'));
  if (['mount', 'pet', 'costume', 'equipped'].indexOf(type) === -1) {
    throw new BadRequest(errorMessage('invalidTypeEquip'));
  }

  let message;

  switch (type) { // eslint-disable-line default-case
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

      const item = content.gear.flat[key];

      if (user.items.gear[type][item.type] === key) {
        user.items.gear[type] = {

          ...(
            user.items.gear[type].toObject
              ? user.items.gear[type].toObject()
              : user.items.gear[type]
          ),
          [item.type]: `${item.type}_base_0`,
        };
        if (user.markModified && type === 'owned') user.markModified('items.gear.owned');

        message = i18n.t('messageUnEquipped', {
          itemText: item.text(req.language),
        }, req.language);
      } else {
        user.items.gear[type] = {

          ...(
            user.items.gear[type].toObject
              ? user.items.gear[type].toObject()
              : user.items.gear[type]
          ),
          [item.type]: item.key,
        };
        if (user.markModified && type === 'owned') user.markModified('items.gear.owned');

        message = handleTwoHanded(user, item, type, req);
      }
      break;
    }
  }

  const res = [user.items];
  if (message) res.push(message);
  return res;
}
