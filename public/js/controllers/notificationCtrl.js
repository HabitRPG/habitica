'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'User', 'Guide', function ($scope, $rootScope, User, Guide) {

    Guide.initTour();

    function growlNotification(html, type) {
      $.bootstrapGrowl(html, {
        ele: '#notification-area',
        type: type, //(null, 'info', 'error', 'success', 'gp', 'xp', 'hp', 'lvl','death')
        top_offset: 20,
        align: 'right', //('left', 'right', or 'center')
        width: 250, //(integer, or 'auto')
        delay: 3000,
        allow_dismiss: true,
        stackup_spacing: 10 // spacing between consecutive stacecked growls.
      });
    };

    /*
     Sets up "+1 Exp", "Level Up", etc notifications
     */
    function setupGrowlNotifications() {

      function statsNotification(html, type) {
        // don't show notifications if user dead
        if (User.user.stats.lvl == 0) return;
        growlNotification(html, type);
      };

      /**
       Show "+ 5 {gold_coin} 3 {silver_coin}"
       */
      function showCoins(money) {
        var absolute, gold, silver;
        absolute = Math.abs(money);
        gold = Math.floor(absolute);
        silver = Math.floor((absolute - gold) * 100);
        if (gold && silver > 0) {
          return "" + gold + " <i class='icon-gold'></i> " + silver + " <i class='icon-silver'></i>";
        } else if (gold > 0) {
          return "" + gold + " <i class='icon-gold'></i>";
        } else if (silver > 0) {
          return "" + silver + " <i class='icon-silver'></i>";
        }
      };

      $rootScope.$watch('user.stats.hp', function(after, before) {
        if (after == before) return;
        var num = after - before;
        var rounded = Math.abs(num.toFixed(1));
        if (num < 0) {
          //lost hp from purchase
          statsNotification("<i class='icon-heart'></i> - " + rounded + " HP", 'hp');
        } else if (num > 0) {
          // gained hp from potion/level?
          statsNotification("<i class='icon-heart'></i> + " + rounded + " HP", 'hp');
        }
      });

      $rootScope.$watch('user.stats.exp', function(after, before) {
        if (after == before) return;
        var num = after - before;
        var rounded = Math.abs(num.toFixed(1));
        // TODO fix hackey negative notification supress
        if (num < 0 && num > -50) {
          statsNotification("<i class='icon-star'></i> - " + rounded + " XP", 'xp');
        } else if (num > 0) {
          statsNotification("<i class='icon-star'></i> + " + rounded + " XP", 'xp');
        }
      });

      $rootScope.$watch('user.stats.gp', function(after, before) {
        if (after == before) return;
        var bonus, money, sign;
        money = after - before;

        //why is this happening? gotta find where stats.gp is being set from (-)habit
        //if (!money) {
        //  return;
        //}

        sign = money < 0 ? '-' : '+';
        statsNotification("" + sign + " " + (showCoins(money)), 'gp');

        //Append Bonus TODO
        //bonus = model.get('_streakBonus');

        if ((money > 0) && !!bonus) {
          if (bonus < 0.01) {
            bonus = 0.01;
          }
          statsNotification("+ " + (showCoins(bonus)) + "  Streak Bonus!");
          //model.del('_streakBonus');
        }
      });

      // FIXME
//      user.on('set', 'items.*', function(item, after, before) {
//        if ((item === 'armor' || item === 'weapon' || item === 'shield' || item === 'head') && parseInt(after) < parseInt(before)) {
//          //don't want to day "lost a head"
//          if (item === 'head') {
//            item = 'helm';
//          }
//          return statsNotification("<i class='icon-death'></i> Respawn!", "death");
//        }
//      });

      $rootScope.$watch('user.stats.lvl', function(after, before) {
        if (after == before) return;
        if (after > before) {
          statsNotification('<i class="icon-chevron-up"></i> Level Up!', 'lvl');
        }
      });
    };

    setupGrowlNotifications();
  }
]);
