'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'User', 'Guide', 'Notification', function ($scope, $rootScope, User, Guide, Notification) {

    $rootScope.$watch('user.stats.hp', function(after, before) {
      if (after == before) return;
      if (User.user.stats.lvl == 0) return;
      Notification.hp(after - before, 'hp');
    });

    $rootScope.$watch('user.stats.exp', function(after, before) {
      if (after == before) return;
      if (User.user.stats.lvl == 0) return;
      Notification.exp(after - before);
    });

    $rootScope.$watch('user.stats.gp', function(after, before) {
      if (after == before) return;
      if (User.user.stats.lvl == 0) return;
      var money = after - before;
      Notification.gp(money);

      //Append Bonus
      var bonus = User.user._tmp.streakBonus;

      if ((money > 0) && !!bonus) {
        if (bonus < 0.01) bonus = 0.01;
        Notification.text("+ " + Notification.coins(bonus) + "  Streak Bonus!");
        delete User.user._tmp.streakBonus;
      }
    });

    $rootScope.$watch('user._tmp.drop', function(after, before){
      // won't work when getting the same item twice?
      if (after == before || !after) return;
      var type = (after.type == 'Food') ? 'food' :
        (after.type == 'HatchingPotion') ? 'hatchingPotions' : // can we use camelcase and remove this line?
        (after.type.toLowerCase() + 's');
      if(!User.user.items[type][after.key]){
        User.user.items[type][after.key] = 0;
      }
      User.user.items[type][after.key]++;
      Notification.text(User.user._tmp.drop.dialog);
    });

    $rootScope.$watch('user.achievements.streak', function(after, before){
      if(after == before || after < before) return;
      $rootScope.modals.achievements.streak = true;
    });

    $rootScope.$watch('user.achievements.ultimateGear', function(after, before){
      if (after === before || after !== true) return;
      $rootScope.modals.achievements.ultimateGear = true;
    });

    $rootScope.$watch('user.items.pets', function(after, before){
      if(_.size(after) === _.size(before) || 
        $rootScope.Shared.countPets(null, after) < 90) return;
      User.user.achievements.beastMaster = true;
      $rootScope.modals.achievements.beastMaster = true;
    }, true);

    /*_.each(['weapon', 'head', 'chest', 'shield'], function(watched){
      $rootScope.$watch('user.items.' + watched, function(before, after){
        if (after == before) return;
        if (+after < +before) {
          Notification.death();
          //don't want to day "lost a head"
          if (watched === 'head') watched = 'helm';
          Notification.text('Lost GP, 1 LVL, ' + watched);
        }
      })
    });*/

    $rootScope.$watch('user.stats.lvl', function(after, before) {
      if (after == before) return;
      if (after > before) {
        Notification.lvl();
      }
    });

    $rootScope.$on('responseError', function(ev, error){
      Notification.error(error);
    });
  }
]);
