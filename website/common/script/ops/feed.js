import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';
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

function evolve (user, pet, req) {
  user.items.pets[pet.key] = -1;

  user.items.mounts = {
    ...user.items.mounts,
    [pet.key]: true,
  };
  if (user.markModified) {
    user.markModified('items.pets');
    user.markModified('items.mounts');
  }

  if (pet.key === user.items.currentPet) {
    user.items.currentPet = '';
  }

  return i18n.t('messageEvolve', {
    egg: pet.text(req.language),
  }, req.language);
}

export default function feed (user, req = {}, analytics) {
  let pet = get(req, 'params.pet');
  const foodK = get(req, 'params.food');
  let amount = Number(get(req.query, 'amount', 1));
  let foodFactor;

  if (!pet || !foodK) throw new BadRequest(errorMessage('missingPetFoodFeed'));

  pet = content.petInfo[pet];

  if (!pet) {
    throw new BadRequest(errorMessage('invalidPetName'));
  }

  const food = content.food[foodK];
  if (!food) {
    throw new NotFound(errorMessage('invalidFoodName', req.language));
  }

  if (!user.items.pets[pet.key]) {
    throw new NotFound(i18n.t('messagePetNotFound', req.language));
  }

  if (!user.items.food[food.key]) {
    throw new NotFound(i18n.t('messageFoodNotFound', req.language));
  }

  if (pet.type === 'special' || pet.type === 'wacky') {
    throw new NotAuthorized(i18n.t('messageCannotFeedPet', req.language));
  }

  if (user.items.mounts[pet.key]) {
    throw new NotAuthorized(i18n.t('messageAlreadyMount', req.language));
  }

  if (!Number.isInteger(amount) || amount < 0) {
    throw new BadRequest(i18n.t('invalidAmount', req.language));
  }

  if (amount > user.items.food[food.key]) {
    throw new NotAuthorized(i18n.t('notEnoughFood', req.language));
  }

  if (food.target === pet.potion || pet.type === 'premium') {
    foodFactor = 5;
  } else {
    foodFactor = 2;
  }

  if ((user.items.pets[pet.key] + (amount * foodFactor)) >= (50 + foodFactor)) {
    throw new NotAuthorized(i18n.t('tooMuchFood', req.language));
  }

  let message;

  if (food.key === 'Saddle') {
    amount = 1;
    message = evolve(user, pet, req);
  } else {
    const messageParams = {
      egg: pet.text(req.language),
      foodText: food.textThe(req.language),
    };

    if (food.target === pet.potion || pet.type === 'premium') {
      user.items.pets[pet.key] += foodFactor * amount;
      message = i18n.t('messageLikesFood', messageParams, req.language);
    } else {
      user.items.pets[pet.key] += foodFactor * amount;
      message = i18n.t('messageDontEnjoyFood', messageParams, req.language);
    }

    if (user.markModified) user.markModified('items.pets');

    if (user.items.pets[pet.key] >= 50 && !user.items.mounts[pet.key]) {
      message = evolve(user, pet, req);
    }

    if (!user.achievements.fedPet && user.addAchievement) {
      user.addAchievement('fedPet');
      checkOnboardingStatus(user, req, analytics);
    }
  }

  user.items.food[food.key] -= 1 * amount;
  if (user.markModified) user.markModified('items.food');

  forEach(content.animalColorAchievements, achievement => {
    if (!user.achievements[achievement.mountAchievement]) {
      const mountIndex = findIndex(keys(content.dropEggs), animal => !user.items.mounts[`${animal}-${achievement.color}`]);
      if (mountIndex === -1) {
        user.achievements[achievement.mountAchievement] = true;
        if (user.addNotification) {
          const achievementString = `achievement${upperFirst(achievement.mountAchievement)}`;
          user.addNotification(achievement.mountNotificationType, {
            label: `${'achievement'}: ${achievementString}`,
            achievement: achievement.mountAchievement,
            message: `${i18n.t('modalAchievement')} ${i18n.t(achievementString)}`,
            modalText: i18n.t(`${achievementString}ModalText`),
          });
        }
      }
    }
  });

  if (analytics && moment().diff(user.auth.timestamps.created, 'days') < 7) {
    analytics.track('pet feed', {
      uuid: user._id,
      foodKey: food.key,
      petKey: pet.key,
      category: 'behavior',
      headers: req.headers,
    });
  }

  return [
    user.items.pets[pet.key],
    message,
  ];
}
