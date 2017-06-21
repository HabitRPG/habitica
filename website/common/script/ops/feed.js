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
  handleMountAchievements(user);
  if (pet.key === user.items.currentPet) {
    user.items.currentPet = '';
  }

  return i18n.t('messageEvolve', {
    egg: pet.text(req.language),
  }, req.language);
}
function handleMountAchievements(_user) {
    console.log("MC-1 " + _user.achievements.mountCollector);

    //Mount collector
    var mountCount = 0;
    for (var i in _user.items.mounts) {
        if (_user.items.mounts[i]) mountCount++;
    }
    //tracks mounts raised on mobile, or before the achievement was added
    console.log("MC0 " + _user.achievements.mountCollector);
    console.log(mountCount);
    //var retrospectiveCount = (user.achievements.mountMasterCount || 0) * 90 + (mountsCount || 0);
    //console.log(retrospectiveCount);
    console.log("MC1 " + _user.achievements.mountCollector);
    _user.achievements.mountCollector = Math.max(mountCount, (_user.achievements.mountCollector || 0) + 1);
    console.log("MC: " + _user.achievements.mountCollector);
}

module.exports = function feed(user, req = {}) {
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