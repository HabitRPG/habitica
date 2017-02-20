import i18n from '../i18n';
import content from '../content/index';
import get from 'lodash/get';
import pick from 'lodash/pick';
import splitWhitespace from '../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';

module.exports = function buySpecialSpell (user, req = {}) {
  let key = get(req, 'params.key');
  if (!key) throw new BadRequest(i18n.t('missingKeyParam', req.language));

  let item = content.special[key];
  if (!item) throw new NotFound(i18n.t('spellNotFound', {spellId: key}, req.language));

  if (user.stats.gp < item.value) {
    throw new NotAuthorized(i18n.t('messageNotEnoughGold', req.language));
  }
  user.stats.gp -= item.value;

  user.items.special[key]++;

  return [
    pick(user, splitWhitespace('items stats')),
    i18n.t('messageBought', {
      itemText: item.text(req.language),
    }, req.language),
  ];
};
