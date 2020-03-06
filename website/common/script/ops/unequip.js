import get from 'lodash/get';
import content from '../content/index';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import errorMessage from '../libs/errorMessage';

export const UNEQUIP_PET_MOUNT = 'pet-mount-background';
export const UNEQUIP_COSTUME = 'costume';
export const UNEQUIP_EQUIPPED = 'equipped';

export function unEquipByType (user, req = {}) {
  // Being type a parameter followed by another parameter
  // when using the API it must be passes specifically in the URL, it's won't default to equipped
  const type = get(req, 'params.type', 'equipped');

  if ([UNEQUIP_PET_MOUNT, UNEQUIP_COSTUME, UNEQUIP_EQUIPPED].indexOf(type) === -1) {
    throw new BadRequest(errorMessage('invalidTypeEquip'));
  }

  let message;

  switch (type) { // eslint-disable-line default-case
    case UNEQUIP_PET_MOUNT: {
      user.items.currentMount = '';
      user.items.currentPet = '';
      user.preferences.background = '';

      message = i18n.t('messagePetMountBackgroundUnEquipped', {}, req.language);
      break;
    }

    case UNEQUIP_COSTUME:
    case UNEQUIP_EQUIPPED: {
      for (const gearType of content.gearTypes) {
        user.items.gear[type][gearType] = `${gearType}_base_0`;
      }

      message = i18n.t(type === UNEQUIP_COSTUME
        ? 'messageCostumeUnEquipped'
        : 'messageBattleGearUnEquipped', {}, req.language);

      break;
    }
  }

  const res = [user.items];
  if (message) res.push(message);
  return res;
}
