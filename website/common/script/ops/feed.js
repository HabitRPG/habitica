import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';
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

function evolve (user, pet, req) {
  user.items.pets = {
    ...user.items.pets,
    [pet.key]: -1,
  };
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

export default function feed (user, req = {}) {
  let pet = get(req, 'params.pet');
  const foodK = get(req, 'params.food');

  if (!pet || !foodK) throw new BadRequest(errorMessage('missingPetFoodFeed'));

  pet = content.petInfo[pet];

  if (!pet) {
    throw new BadRequest(errorMessage('invalidPetName'));
  }

  const food = content.food[foodK];
  if (!food) {
    throw new NotFound(errorMessage('invalidFoodName', req.language));
  }

  const userPets = user.items.pets;

  if (!userPets[pet.key]) {
    throw new NotFound(i18n.t('messagePetNotFound', req.language));
  }

  if (!user.items.food[food.key]) {
    throw new NotFound(i18n.t('messageFoodNotFound', req.language));
  }

  if (pet.type === 'special') {
    throw new NotAuthorized(i18n.t('messageCannotFeedPet', req.language));
  }

  if (user.items.mounts[pet.key]) {
    throw new NotAuthorized(i18n.t('messageAlreadyMount', req.language));
  }

  let message;

  if (food.key === 'Saddle') {
    message = evolve(user, pet, req);
  } else {
    const messageParams = {
      egg: pet.text(req.language),
      foodText: food.textThe(req.language),
    };

    if (food.target === pet.potion || pet.type === 'premium') {
      userPets[pet.key] += 5;
      message = i18n.t('messageLikesFood', messageParams, req.language);
    } else {
      userPets[pet.key] += 2;
      message = i18n.t('messageDontEnjoyFood', messageParams, req.language);
    }

    if (user.markModified) user.markModified('items.pets');

    if (userPets[pet.key] >= 50 && !user.items.mounts[pet.key]) {
      message = evolve(user, pet, req);
    }
  }

  user.items.food[food.key] -= 1;
  if (user.markModified) user.markModified('items.food');

  forEach(content.animalColorAchievements, achievement => {
    if (!user.achievements[achievement.mountAchievement]) {
      const mountIndex = findIndex(keys(content.dropEggs), animal => !user.items.mounts[`${animal}-${achievement.color}`]);
      if (mountIndex === -1) {
        user.achievements[achievement.mountAchievement] = true;
        if (user.addNotification) {
          const achievementString = `achievement${upperFirst(achievement.mountAchievement)}`;
          user.addNotification(achievement.mountNotificationType, {
            achievement: achievement.mountAchievement,
            message: `${i18n.t('modalAchievement')} ${i18n.t(achievementString)}`,
            modalText: i18n.t(`${achievementString}ModalText`),
          });
        }
      }
    }
  });

  return [
    userPets[pet.key],
    message,
  ];
}
