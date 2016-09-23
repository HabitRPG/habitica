import _ from 'lodash';
import i18n from '../i18n';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';
import content from '../content/index';

module.exports = function readCard (user, req = {}) {
  let cardType = _.get(req.params, 'cardType');

  if (!cardType) {
    throw new BadRequest(i18n.t('cardTypeRequired', req.language));
  }

  if (_.keys(content.cardTypes).indexOf(cardType) === -1) {
    throw new NotAuthorized(i18n.t('cardTypeNotAllowed', req.language));
  }

  user.items.special[`${cardType}Received`].shift();
  user.flags.cardReceived = false;

  return [
    { specialItems: user.items.special, cardReceived: user.flags.cardReceived },
    i18n.t('readCard', {cardType}, req.language),
  ];
};
