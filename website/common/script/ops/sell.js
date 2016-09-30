import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import splitWhitespace from '../libs/splitWhitespace';
import {
  NotFound,
  NotAuthorized,
  BadRequest,
} from '../libs/errors';

const ACCEPTEDTYPES = ['eggs', 'hatchingPotions', 'food'];

module.exports = function sell (user, req = {}) {
  let key = _.get(req.params, 'key');
  let type = _.get(req.params, 'type');

  if (!type) {
    throw new BadRequest(i18n.t('typeRequired', req.language));
  }

  if (!key) {
    throw new BadRequest(i18n.t('keyRequired', req.language));
  }

  if (ACCEPTEDTYPES.indexOf(type) === -1) {
    throw new NotAuthorized(i18n.t('typeNotSellable', {acceptedTypes: ACCEPTEDTYPES.join(', ')}, req.language));
  }

  if (!user.items[type][key]) {
    throw new NotFound(i18n.t('userItemsKeyNotFound', {type}, req.language));
  }

  user.items[type][key]--;
  user.stats.gp += content[type][key].value;

  return [
    _.pick(user, splitWhitespace('stats items')),
  ];
};
