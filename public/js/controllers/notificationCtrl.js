'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'User', 'Guide', 'Notification', function ($scope, $rootScope, User, Guide, Notification) {

    $rootScope.$watch('user.stats.hp', function(after, before) {
      if (after == before) return;
      Notification.hp(after - before, 'hp');
    });

    $rootScope.$watch('user.stats.exp', function(after, before) {
      if (after == before) return;
      Notification.exp(after - before);
    });

    $rootScope.$watch('user.stats.gp', function(after, before) {
      if (after == before) return;
      var money = after - before;
      Notification.gp(money);

      //Append Bonus
      var bonus = User.user._tmp.streakBonus;

      if ((money > 0) && !!bonus) {
        if (bonus < 0.01) bonus = 0.01;
        Notification.text("+ " + Notification.coins(bonus) + "  Streak Bonus!");
      }
    });

    $rootScope.$watch('user._tmp.drop', function(after, before){
      if (after == before || !after) return;
      $rootScope.modals.drop = true;
    });

    // FIXME: this isn't working for some reason
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
  }
]);
