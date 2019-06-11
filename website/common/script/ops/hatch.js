import content from '../content/index';
import i18n from '../i18n';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import errorMessage from '../libs/errorMessage';

module.exports = function hatch (user, req = {}) {
  let egg = get(req, 'params.egg');
  let hatchingPotion = get(req, 'params.hatchingPotion');

  if (!(egg && hatchingPotion)) {
    throw new BadRequest(errorMessage('missingEggHatchingPotion'));
  }

  if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
    throw new NotFound(i18n.t('messageMissingEggPotion', req.language));
  }

  if ((content.hatchingPotions[hatchingPotion].premium || content.hatchingPotions[hatchingPotion].wacky) && !content.dropEggs[egg]) {
    throw new BadRequest(i18n.t('messageInvalidEggPotionCombo', req.language));
  }

  let pet = `${egg}-${hatchingPotion}`;

  if (user.items.pets[pet] && user.items.pets[pet] > 0) {
    throw new NotAuthorized(i18n.t('messageAlreadyPet', req.language));
  }

  user.items.pets[pet] = 5;
  user.items.eggs[egg]--;
  user.items.hatchingPotions[hatchingPotion]--;
  if (user.markModified) {
    user.markModified('items.pets');
    user.markModified('items.eggs');
    user.markModified('items.hatchingPotions');
  }

  if (!user.achievements.backToBasics) {
    const petIndex = findIndex(content.basePetsMounts, (animal) => {
      return isNaN(user.items.pets[animal]) || user.items.pets[animal] <= 0;
    });
    if (petIndex === -1) {
      user.achievements.backToBasics = true;
      if (user.addNotification) {
        user.addNotification('ACHIEVEMENT_BACK_TO_BASICS', {
          achievement: 'backToBasics',
          message: `${i18n.t('modalAchievement')} ${i18n.t('achievementBackToBasics')}`,
          modalText: i18n.t('achievementBackToBasicsModalText'),
        });
      }
    }
  }

  return [
    user.items,
    i18n.t('messageHatched', req.language),
  ];
};
