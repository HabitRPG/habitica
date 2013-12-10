/**
 * Probably the biggest migration of all! This adds the following features:
 *  - Customization Redo: https://trello.com/c/YKXmHNjY/306-customization-redo
 *  - Armory: https://trello.com/c/83M5RqQB/299-armory
 *  - Classes
 */

db.users.find().forEach(function(user){

  user.stats.class = 'warrior';

  // set default stats (inc mp)

  // grant backer/contrib gear, 300, rather than using js logic

  // customizations redo: https://trello.com/c/YKXmHNjY/306-customization-redo

  // migrate current owned items

  // gender => size
  user.preferences.size = (user.preferences.gender == 'f') ? 'slim' : 'broad';
  delete user.preferences.gender;

  // Delete armorSet
  delete user.preferences.armorSet;

  db.users.update({_id:user._id}, user);
});