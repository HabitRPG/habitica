import get from 'lodash/get';
import keys from 'lodash/keys';
import i18n from '../i18n';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';
import content from '../content/index';

// @TODO move in the servercontroller or keep here?
function markNotificationAsRead (user, cardType) {
  const indexToRemove = user.notifications.findIndex(notification => {
    if (
      notification
      && notification.type === 'CARD_RECEIVED'
      && notification.data
      && notification.data.card === cardType
    ) return true;

    return false;
  });

  if (indexToRemove !== -1) user.notifications.splice(indexToRemove, 1);
}

export default function readCard (user, req = {}) {
  const cardType = get(req.params, 'cardType');

  if (!cardType) {
    throw new BadRequest(i18n.t('cardTypeRequired', req.language));
  }

  if (keys(content.cardTypes).indexOf(cardType) === -1) {
    throw new NotAuthorized(i18n.t('cardTypeNotAllowed', req.language));
  }

  user.items.special[`${cardType}Received`].shift();
  user.flags.cardReceived = false;

  markNotificationAsRead(user, cardType);

  return [
    { specialItems: user.items.special, cardReceived: user.flags.cardReceived },
    i18n.t('readCard', { cardType }, req.language),
  ];
}
