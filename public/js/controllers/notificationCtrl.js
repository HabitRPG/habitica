'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'Shared', 'User', 'Guide', 'Notification',
  function ($scope, $rootScope, Shared, User, Guide, Notification) {

    $rootScope.$watch('user.stats.hp', function(after, before) {
      if (after <= 0){
        $rootScope.openModal('death', {keyboard:false, backdrop:'static'});
      }
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
      var bonus = User.user._tmp.streakBonus;
      Notification.gp(money, bonus || 0);

      //Append Bonus

      if ((money > 0) && !!bonus) {
        if (bonus < 0.01) bonus = 0.01;
        Notification.text("+ " + Notification.coins(bonus) + ' ' + window.env.t('streakCoins'));
        delete User.user._tmp.streakBonus;
      }
    });

    $rootScope.$watch('user.stats.mp', function(after,before) {
       if (after == before) return;
       if (!User.user.flags.classSelected || User.user.preferences.disableClasses) return;
       var mana = after - before;
       Notification.mp(mana);
    });

    $rootScope.$watch('user._tmp.crit', function(after, before){
       if (after == before || !after) return;
       var amount = User.user._tmp.crit * 100 - 100;
       // reset the crit counter
       User.user._tmp.crit = undefined;
       Notification.crit(amount);
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
      Notification.drop(User.user._tmp.drop.dialog);
    });

    $rootScope.$watch('user.achievements.streak', function(after, before){
      if(before == undefined || after == before || after < before) return;
      $rootScope.openModal('achievements/streak');
    });

    $rootScope.$watch('user.achievements.ultimateGear', function(after, before){
      if (after === before || after !== true) return;
      $rootScope.openModal('achievements/ultimateGear');
    });

    $rootScope.$watch('user.items.pets', function(after, before){
      if(_.size(after) === _.size(before) || 
        Shared.countPets(null, after) < 90) return;
      User.user.achievements.beastMaster = true;
      $rootScope.openModal('achievements/beastMaster');
    }, true);

    $rootScope.$watch('user.achievements.rebirths', function(after, before){
      if(after === before) return;
      $rootScope.openModal('achievements/rebirth');
    });

    $rootScope.$watch('user.flags.contributor', function(after, before){
      if (after === before || after !== true) return;
      $rootScope.openModal('achievements/contributor');
    });

    /*_.each(['weapon', 'head', 'chest', 'shield'], function(watched){
      $rootScope.$watch('user.items.' + watched, function(before, after){
        if (after == before) return;
        if (+after < +before) {
          //don't want to day "lost a head"
          if (watched === 'head') watched = 'helm';
          Notification.text('Lost GP, 1 LVL, ' + watched);
        }
      })
    });*/

    // Classes modal
    $rootScope.$watch('!user.flags.classSelected && user.stats.lvl >= 10', function(after, before){
      if(after){
        $rootScope.openModal('chooseClass', {controller:'UserCtrl', keyboard:false, backdrop:'static'});
      }
    });

    $rootScope.$watch('user.stats.lvl', function(after, before) {
      if (after == before) return;
      if (after > before) {
        Notification.lvl();
      }
    });

    // Completed quest modal
    $rootScope.$watch('user.party.quest.completed', function(after, before){
      if (after == before || after != true) return;
      $rootScope.openModal('questCompleted', {controller:'InventoryCtrl'});
    });

    // Quest invitation modal
    $rootScope.$watch('party.quest.key && !party.quest.active && party.quest.members[user._id] == undefined', function(after, before){
      if (after == before || after != true) return;
      $rootScope.openModal('questInvitation');
    });

    $rootScope.$on('responseError', function(ev, error){
      Notification.error(error);
    });
    $rootScope.$on('responseText', function(ev, error){
      Notification.text(error);
    });
  }
]);
