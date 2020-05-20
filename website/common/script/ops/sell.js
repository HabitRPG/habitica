import get from 'lodash/get';
import pick from 'lodash/pick';
import content from '../content/index';
import i18n from '../i18n';
import splitWhitespace from '../libs/splitWhitespace';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

// @TODO: 'special' type throws NotAuthorized error
const ACCEPTEDTYPES = ['eggs', 'hatchingPotions', 'food'];

export default function sell (user, req = {}) {
  const key = get(req.params, 'key');
  const type = get(req.params, 'type');
  const amount = get(req.query, 'amount', 1);

  if (amount < 0) {
    throw new BadRequest(i18n.t('positiveAmountRequired', req.language));
  }

  if (!type) {
    throw new BadRequest(i18n.t('typeRequired', req.language));
  }

  if (!key) {
    throw new BadRequest(i18n.t('missingKeyParam', req.language));
  }

  if (ACCEPTEDTYPES.indexOf(type) === -1) {
    throw new NotAuthorized(i18n.t('typeNotSellable', { acceptedTypes: ACCEPTEDTYPES.join(', ') }, req.language));
  }

  if (!user.items[type][key]) {
    throw new NotFound(i18n.t('userItemsKeyNotFound', { type }, req.language));
  }

  const currentAmount = user.items[type][key];

  if (amount > currentAmount) {
    throw new NotFound(i18n.t('userItemsNotEnough', { type }, req.language));
  }

  if (type === 'food' && key === 'Saddle') {
    throw new NotAuthorized(content[type][key].sellWarningNote(req.language));
  }

  user.items[type][key] -= amount;
  if (user.markModified) user.markModified(`items.${type}`);

  user.stats.gp += content[type][key].value * amount;

  return [
    pick(user, splitWhitespace('stats items')),
  ];
}
