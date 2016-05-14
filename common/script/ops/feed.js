import content from '../content/index';
import i18n from '../i18n';
import _ from 'lodash';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../libs/errors';

function evolve (user, pet, petDisplayName, req) {
  user.items.pets[pet] = -1;
  user.items.mounts[pet] = true;

  if (pet === user.items.currentPet) {
    user.items.currentPet = '';
  }

  return i18n.t('messageEvolve', {
    egg: petDisplayName,
  }, req.language);
}

module.exports = function feed (user, req = {}) {
  let pet = _.get(req, 'params.pet');
  let foodK = _.get(req, 'params.food');

  if (!pet || !foodK) throw new BadRequest(i18n.t('missingPetFoodFeed'));

  if (pet.indexOf('-') === -1) {
    throw new BadRequest(i18n.t('invalidPetName', req.language));
  }

  let food = content.food[foodK];
  if (!food) {
    throw new NotFound(i18n.t('messageFoodNotFound', req.language));
  }

  let userPets = user.items.pets;

  if (!userPets[pet]) {
    throw new NotFound(i18n.t('messagePetNotFound', req.language));
  }

  let [egg, potion] = pet.split('-');

  let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
  let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

  let petDisplayName = i18n.t('petName', {
    potion: potionText,
    egg: eggText,
  }, req.language);

  if (!user.items.food[food.key]) {
    throw new NotFound(i18n.t('messageFoodNotFound', req.language));
  }

  if (content.specialPets[pet]) {
    throw new NotAuthorized(i18n.t('messageCannotFeedPet', req.language));
  }

  if (user.items.mounts[pet]) {
    throw new NotAuthorized(i18n.t('messageAlreadyMount', req.language));
  }

  let message;

  if (food.key === 'Saddle') {
    message = evolve(user, pet, petDisplayName, req);
  } else {
    if (food.target === potion || content.hatchingPotions[potion].premium) {
      userPets[pet] += 5;
      message = i18n.t('messageLikesFood', {
        egg: petDisplayName,
        foodText: food.text(req.language),
      }, req.language);
    } else {
      userPets[pet] += 2;
      message = i18n.t('messageDontEnjoyFood', {
        egg: petDisplayName,
        foodText: food.text(req.language),
      }, req.language);
    }

    if (userPets[pet] >= 50 && !user.items.mounts[pet]) {
      message = evolve(user, pet, petDisplayName, req);
    }
  }

  user.items.food[food.key]--;

  if (req.v2 === true) {
    return {
      value: userPets[pet],
    };
  } else {
    return [
      userPets[pet],
      message,
    ];
  }
};
