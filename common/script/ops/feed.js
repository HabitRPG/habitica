import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb) {
  var egg, eggText, evolve, food, message, pet, petDisplayName, potion, potionText, ref, ref1, ref2, userPets;
  ref = req.params, pet = ref.pet, food = ref.food;
  food = content.food[food];
  ref1 = pet.split('-'), egg = ref1[0], potion = ref1[1];
  userPets = user.items.pets;
  potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
  eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;
  petDisplayName = i18n.t('petName', {
    potion: potionText,
    egg: eggText
  });
  if (!userPets[pet]) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messagePetNotFound', req.language)
    }) : void 0;
  }
  if (!((ref2 = user.items.food) != null ? ref2[food.key] : void 0)) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageFoodNotFound', req.language)
    }) : void 0;
  }
  if (content.specialPets[pet]) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageCannotFeedPet', req.language)
    }) : void 0;
  }
  if (user.items.mounts[pet]) {
    return typeof cb === "function" ? cb({
      code: 401,
      message: i18n.t('messageAlreadyMount', req.language)
    }) : void 0;
  }
  message = '';
  evolve = function() {
    userPets[pet] = -1;
    user.items.mounts[pet] = true;
    if (pet === user.items.currentPet) {
      user.items.currentPet = "";
    }
    return message = i18n.t('messageEvolve', {
      egg: petDisplayName
    }, req.language);
  };
  if (food.key === 'Saddle') {
    evolve();
  } else {
    if (food.target === potion || content.hatchingPotions[potion].premium) {
      userPets[pet] += 5;
      message = i18n.t('messageLikesFood', {
        egg: petDisplayName,
        foodText: food.text(req.language)
      }, req.language);
    } else {
      userPets[pet] += 2;
      message = i18n.t('messageDontEnjoyFood', {
        egg: petDisplayName,
        foodText: food.text(req.language)
      }, req.language);
    }
    if (userPets[pet] >= 50 && !user.items.mounts[pet]) {
      evolve();
    }
  }
  user.items.food[food.key]--;
  return typeof cb === "function" ? cb({
    code: 200,
    message: message
  }, {
    value: userPets[pet]
  }) : void 0;
};
