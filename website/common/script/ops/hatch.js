import findIndex from 'lodash/findIndex';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import keys from 'lodash/keys';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import i18n from '../i18n';
import content from '../content/index';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';
import errorMessage from '../libs/errorMessage';
import { checkOnboardingStatus } from '../libs/onboarding';

export default function hatch (user, req = {}, analytics) {
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
  user.items.eggs[egg] -= 1;
  user.items.hatchingPotions[hatchingPotion] -= 1;
  if (user.markModified) {
    user.markModified('items.pets');
    user.markModified('items.eggs');
    user.markModified('items.hatchingPotions');
  }

  if (!user.achievements.hatchedPet && user.addAchievement) {
    user.addAchievement('hatchedPet');
    checkOnboardingStatus(user, analytics);
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

  if (analytics && moment().diff(user.auth.timestamps.created, 'days') < 7) {
    analytics.track('pet hatch', {
      uuid: user._id,
      petKey: pet,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items,
    i18n.t('messageHatched', req.language),
  ];
}
