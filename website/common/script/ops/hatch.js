import content from '../content/index';
import i18n from '../i18n';
import get from 'lodash/get';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';

module.exports = function hatch (user, req = {}) {
  let egg = get(req, 'params.egg');
  let hatchingPotion = get(req, 'params.hatchingPotion');

  if (!(egg && hatchingPotion)) {
    throw new BadRequest(i18n.t('missingEggHatchingPotionHatch', req.language));
  }

  if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
    throw new NotFound(i18n.t('messageMissingEggPotion', req.language));
  }

  if (content.hatchingPotions[hatchingPotion].premium && !content.dropEggs[egg]) {
    throw new BadRequest(i18n.t('messageInvalidEggPotionCombo', req.language));
  }

  let pet = `${egg}-${hatchingPotion}`;

  if (user.items.pets[pet] && user.items.pets[pet] > 0) {
    throw new NotAuthorized(i18n.t('messageAlreadyPet', req.language));
  }

  user.items.pets[pet] = 5;
  user.items.eggs[egg]--;
  user.items.hatchingPotions[hatchingPotion]--;

  return [
    user.items,
    i18n.t('messageHatched', req.language),
  ];
};
