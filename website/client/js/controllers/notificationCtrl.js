'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'Shared', 'Content', 'User', 'Guide', 'Notification', 'Analytics', 'Achievement',
  function ($scope, $rootScope, Shared, Content, User, Guide, Notification, Analytics, Achievement) {

    $rootScope.$watch('user.stats.hp', function (after, before) {
      if (after <= 0){
        $rootScope.playSound('Death');
        $rootScope.openModal('death', {keyboard:false, backdrop:'static'});
      } else if (after <= 30 && !User.user.flags.warnedLowHealth) {
        $rootScope.openModal('lowHealth', {keyboard:false, backdrop:'static', controller:'UserCtrl', track:'Health Warning'});
      }
      if (after == before) return;
      if (User.user.stats.lvl == 0) return;
      Notification.hp(after - before, 'hp');
      if (after < 0) $rootScope.playSound('Minus_Habit');
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
      var bonus;
      if (User.user._tmp) {
        bonus = User.user._tmp.streakBonus || 0;
      }
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

    // Levels that already display modals and should not trigger generic Level Up
    var unlockLevels = {
      '3': 'drop system',
      '10': 'class system',
      '50': 'Orb of Rebirth'
    }

    $rootScope.$watch('user.stats.lvl', function(after, before) {
      if (after <= before) return;
      Notification.lvl();
      $rootScope.playSound('Level_Up');
      if (User.user._tmp && User.user._tmp.drop && (User.user._tmp.drop.type === 'Quest')) return;
      if (unlockLevels['' + after]) return;
      if (!User.user.preferences.suppressModals.levelUp) $rootScope.openModal('levelUp', {controller:'UserCtrl', size:'sm'});
    });

    $rootScope.$watch('!user.flags.classSelected && user.stats.lvl >= 10', function(after, before){
      if(after){
        $rootScope.openModal('chooseClass', {controller:'UserCtrl', keyboard:false, backdrop:'static'});
      }
    });

    // Avoid showing the same notiication more than once
    var lastShownNotifications = [];

    function handleUserNotifications (after) {
      if (!after || after.length === 0) return;

      after.forEach(function (notification) {
        if (lastShownNotifications.indexOf(notification.id) !== -1) {
          return;
        }

        lastShownNotifications.push(notification.id);
        if (lastShownNotifications.length > 10) {
          lastShownNotifications.splice(0, 9);
        }

        var markAsRead = true;

        switch (notification.type) {
          case 'DROPS_ENABLED':
            $rootScope.openModal('dropsEnabled');
            break;
          case 'REBIRTH_ENABLED':
            $rootScope.openModal('rebirthEnabled');
            break;
          case 'WON_CHALLENGE':
            User.sync().then( function() {
              Achievement.displayAchievement('wonChallenge');
            });
            break;
          case 'STREAK_ACHIEVEMENT':
            Notification.streak(User.user.achievements.streak);
            $rootScope.playSound('Achievement_Unlocked');
            if (!User.user.preferences.suppressModals.streak) {
              Achievement.displayAchievement('streak', {size: 'md'});
            }
            break;
          case 'ULTIMATE_GEAR_ACHIEVEMENT':
            Achievement.displayAchievement('ultimateGear', {size: 'md'});
            break;
          case 'REBIRTH_ACHIEVEMENT':
            Achievement.displayAchievement('rebirth');
            break;
          case 'NEW_CONTRIBUTOR_LEVEL':
            Achievement.displayAchievement('contributor', {size: 'md'});
            break;
          case 'CRON':
            if (notification.data) {
              if (notification.data.hp) Notification.hp(notification.data.hp, 'hp');
              if (notification.data.mp) Notification.mp(notification.data.mp);
            }
            break;
          default:
            markAsRead = false; // If the notification is not implemented, skip it
            break;
        }

        if (markAsRead) User.readNotification(notification.id);
      });

      User.user.notifications = []; // reset the notifications
    }

    // Since we don't use localStorage anymore, notifications for achievements and new contributor levels
    // are now stored in user.notifications.
    $rootScope.$watchCollection('userNotifications', function (after) {
      if (!User.user._wrapped) return;
      handleUserNotifications(after);
    });

    var handleUserNotificationsOnFirstSync = _.once(function () {
      handleUserNotifications($rootScope.userNotifications);
    });
    $rootScope.$on('userUpdated', handleUserNotificationsOnFirstSync);

    // TODO what about this?
    $rootScope.$watch('user.achievements', function(){
      $rootScope.playSound('Achievement_Unlocked');
    }, true);

    $rootScope.$watch('user.flags.armoireEmpty', function(after,before){
      if (after == before || after == false) return;
      $rootScope.openModal('armoireEmpty');
    });

    // Completed quest modal
    $scope.$watch('user.party.quest.completed', function(after, before){
      if (!after) return;
      $rootScope.openModal('questCompleted', {controller:'InventoryCtrl'});
    });

    // Quest invitation modal
    $scope.$watch('user.party.quest.RSVPNeeded && !user.party.quest.completed', function(after, before){
      if (after != true) return;
      $rootScope.openModal('questInvitation', {controller:'PartyCtrl'});
    });

    $rootScope.$on('responseError500', function(ev, error){
      Notification.error(error);
    });
    $rootScope.$on('responseError', function(ev, error){
      Notification.error(error, true);
    });

    $rootScope.$on('responseText', function(ev, error){
      Notification.text(error);
    });

    // Show new-stuff modal on load
    if (User.user.flags.newStuff)
      $rootScope.openModal('newStuff', {size:'lg'});
  }
]);
