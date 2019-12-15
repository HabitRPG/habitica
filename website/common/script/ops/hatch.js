import findIndex from 'lodash/findIndex';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import keys from 'lodash/keys';
import upperFirst from 'lodash/upperFirst';
import i18n from '../i18n';
import content from '../content/index';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import errorMessage from '../libs/errorMessage';

export default function hatch (user, req = {}) {
  const egg = get(req, 'params.egg');
  const hatchingPotion = get(req, 'params.hatchingPotion');

  if (!(egg && hatchingPotion)) {
    throw new BadRequest(errorMessage('missingEggHatchingPotion'));
  }

  if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
    throw new NotFound(i18n.t('messageMissingEggPotion', req.language));
  }

  if (
    (
      content.hatchingPotions[hatchingPotion].premium
      || content.hatchingPotions[hatchingPotion].wacky
    )
    && !content.dropEggs[egg]
  ) {
    throw new BadRequest(i18n.t('messageInvalidEggPotionCombo', req.language));
  }

  const pet = `${egg}-${hatchingPotion}`;

  if (user.items.pets[pet] && user.items.pets[pet] > 0) {
    throw new NotAuthorized(i18n.t('messageAlreadyPet', req.language));
  }

  user.items.pets = {
    ...user.items.pets,
    [pet]: 5,
  };
  user.items.eggs = {
    ...user.items.eggs,
    [egg]: Number.isInteger(user.items.eggs) ? user.items.eggs - 1 : 0,
  };
  user.items.hatchingPotions[hatchingPotion] -= 1;
  if (user.markModified) {
    user.markModified('items.pets');
    user.markModified('items.eggs');
    user.markModified('items.hatchingPotions');
  }

  forEach(content.animalColorAchievements, achievement => {
    if (!user.achievements[achievement.petAchievement]) {
      const petIndex = findIndex(
        keys(content.dropEggs),
        animal => !user.items.pets[`${animal}-${achievement.color}`] || user.items.pets[`${animal}-${achievement.color}`] <= 0,
      );
      if (petIndex === -1) {
        user.achievements[achievement.petAchievement] = true;
        if (user.addNotification) {
          const achievementString = `achievement${upperFirst(achievement.petAchievement)}`;
          user.addNotification(achievement.petNotificationType, {
            achievement: achievement.petAchievement,
            message: `${i18n.t('modalAchievement')} ${i18n.t(achievementString)}`,
            modalText: i18n.t(`${achievementString}ModalText`),
          });
        }
      }
    }
  });

  return [
    user.items,
    i18n.t('messageHatched', req.language),
  ];
}
