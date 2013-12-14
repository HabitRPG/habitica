/**
 * Huge migration:
 *  - Customization Redo: https://trello.com/c/YKXmHNjY/306-customization-redo
 *  - Armory: https://trello.com/c/83M5RqQB/299-armory
 *  - Classes
 */

db.users.find().forEach(function(user){

  // --------- Misc ---------
  _.defaults(user.purchased, {hair:{},skin:{}});
  user.balance = user.balance || 0;
  user.preferences.sleep = user.flags.rest;
  delete user.flags.rest;
  delete user.preferences.armorSet;

  // --------- Class System ---------
  _.defaults(user.stats, {'class':'warrior', str:0, con:0, int:0, per:0, buffs:{}});
  user.stats.points = user.stats.lvl;
  user.stats.mp = (user.stats.lvl-1)/2 + 10;
  user.flags.classSelected = false;

  // --------- Gender ---------
  user.preferences.size = (user.preferences.gender == 'f') ? 'slim' : 'broad';
  user.preferences.shirt = (user.preferences.gender == 'f') ? 'pink' : 'white';
  user.preferences.hair = {
    color: user.preferences.hair,
    base: user.preferences.gender == 'f' ? 1 : 0,
    bangs: user.preferences.gender == 'f' ? 1 : 3,
    beard: 0,
    mustache: 0
  };
  delete user.preferences.gender;

  // --------- Skin (see https://trello.com/c/YKXmHNjY/306-customization-redo) ---------

  var s = user.preferences.skin;
  user.preferences.skin =
    s == 'asian' ? 'ddc994' :
    s == 'white' ? 'f5a76e' :
    s == 'black' ? '915533' :
    s == 'dead'  ? 'c3e1dc' :
    s == 'orc'   ? '6bd049' : s;


  // --------- Gear ---------
  var gear = {
    owned: {},
    equipped: {},
    costume: {}
  };
  _.each({head:'showHelm',weapon:'showWeapon',shield:'showShield',armor:'showArmor'}, function(show, type){
    user.items[type] = ~~user.items[type];
    _.times(user.items[type], function(i){
      var item =
        (i == 7 && type == 'weapon') ? 'weapon_special_0' :
        (i == 8 && type == 'weapon') ? 'weapon_special_1' :
        (i == 6) ? type + '_special_0' :
        (i == 7) ? type + '_special_1' :
        type + '_warrior_' + i;
      gear.owned[item] = true;
      gear.equipped[type] = item;
      /*if (user.preferences[show] === false) {
        // TODO how to handle combo of wearing / hiding?
        gear.costume[type] = type + '_base_0';
        user.preferences.costume = true;
      }*/
    });
    delete user.preferences[show];
    delete user.items[type];
  })
  user.items.gear = gear;

  // --------- Tasks ---------
  _.each(user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards), function(task){
    // migrate task.priority from !, !!, !!! => 1, 1.5, 2
    var p = task.priority;
    task.priority = (p == '!!!') ? 2 : (p == '!!') ? 1.5 : 1;

    // Add task attributes
    task.attribute = 'str';
    return true;
  });

  db.users.update({_id:user._id}, user);
});