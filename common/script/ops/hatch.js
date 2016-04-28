import content from '../content/index';
import i18n from '../i18n';

module.exports = function(user, req, cb) {
  var egg, hatchingPotion, pet, ref;
  ref = req.params, egg = ref.egg, hatchingPotion = ref.hatchingPotion;
  if (!(egg && hatchingPotion)) {
    return typeof cb === "function" ? cb({
      code: 400,
      message: "Please specify query.egg & query.hatchingPotion"
    }) : void 0;
  }
  if (!(user.items.eggs[egg] > 0 && user.items.hatchingPotions[hatchingPotion] > 0)) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('messageMissingEggPotion', req.language)
    }) : void 0;
  }
  if (content.hatchingPotions[hatchingPotion].premium && !content.dropEggs[egg]) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('messageInvalidEggPotionCombo', req.language)
    }) : void 0;
  }
  pet = egg + "-" + hatchingPotion;
  if (user.items.pets[pet] && user.items.pets[pet] > 0) {
    return typeof cb === "function" ? cb({
      code: 403,
      message: i18n.t('messageAlreadyPet', req.language)
    }) : void 0;
  }
  user.items.pets[pet] = 5;
  user.items.eggs[egg]--;
  user.items.hatchingPotions[hatchingPotion]--;
  return typeof cb === "function" ? cb({
    code: 200,
    message: i18n.t('messageHatched', req.language)
  }, user.items) : void 0;
};
