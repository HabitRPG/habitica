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

function evolve (user, pet, req) {
  user.items.pets[pet.key] = -1;
  user.items.mounts[pet.key] = true;

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

module.exports = function feed (user, req = {}) {
  let pet = get(req, 'params.pet');
  let foodK = get(req, 'params.food');

  if (!pet || !foodK) throw new BadRequest(errorMessage('missingPetFoodFeed'));

  pet = content.petInfo[pet];

  if (!pet) {
    throw new BadRequest(errorMessage('invalidPetName'));
  }

  let food = content.food[foodK];
  if (!food) {
    throw new NotFound(errorMessage('invalidFoodName', req.language));
  }

  let userPets = user.items.pets;

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
    let messageParams = {
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

  user.items.food[food.key]--;
  if (user.markModified) user.markModified('items.food');

  if (!user.achievements.allYourBase) {
    const mountIndex = findIndex(content.basePetsMounts, (animal) => {
      return !user.items.mounts[animal];
    });
    if (mountIndex === -1) {
      user.achievements.allYourBase = true;
      if (user.addNotification) {
        user.addNotification('ACHIEVEMENT_ALL_YOUR_BASE', {
          achievement: 'allYourBase',
          message: `${i18n.t('modalAchievement')} ${i18n.t('achievementAllYourBase')}`,
          modalText: i18n.t('achievementAllYourBaseModalText'),
        });
      }
    }
  }

  return [
    userPets[pet.key],
    message,
  ];
};
