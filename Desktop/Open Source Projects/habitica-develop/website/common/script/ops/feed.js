import content from '../content/index';
import i18n from '../i18n';
import get from 'lodash/get';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';

function evolve (user, pet, req) {
  user.items.pets[pet.key] = -1;
  user.items.mounts[pet.key] = true;

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

  if (!pet || !foodK) throw new BadRequest(i18n.t('missingPetFoodFeed', req.language));

  pet = content.petInfo[pet];

  if (!pet) {
    throw new BadRequest(i18n.t('invalidPetName', req.language));
  }

  let food = content.food[foodK];
  if (!food) {
    throw new NotFound(i18n.t('messageFoodNotFound', req.language));
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
      foodText: food.text(req.language),
    };

    if (food.target === pet.potion || pet.type === 'premium') {
      userPets[pet.key] += 5;
      message = i18n.t('messageLikesFood', messageParams, req.language);
    } else {
      userPets[pet.key] += 2;
      message = i18n.t('messageDontEnjoyFood', messageParams, req.language);
    }

    if (userPets[pet.key] >= 50 && !user.items.mounts[pet.key]) {
      message = evolve(user, pet, req);
    }
  }

  user.items.food[food.key]--;

  return [
    userPets[pet.key],
    message,
  ];
};
