'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', '$rootScope', 'Shared', 'Content', 'User', 'Guide', 'Notification', 'Analytics',
  function ($scope, $rootScope, Shared, Content, User, Guide, Notification, Analytics) {

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

    $rootScope.$watch('user.achievements', function(){
      $rootScope.playSound('Achievement_Unlocked');
    }, true);

    $rootScope.$watch('user.achievements.challenges.length', function(after, before) {
      if (after === before) return;
      if (after > before) {
        $rootScope.openModal('wonChallenge', {controller: 'UserCtrl', size: 'sm'});
      }
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

    $rootScope.$watch('user._tmp.crit', function(after, before){
       if (after == before || !after) return;
       var amount = User.user._tmp.crit * 100 - 100;
       // reset the crit counter
       User.user._tmp.crit = undefined;
       Notification.crit(amount);
    });

    $rootScope.$watch('user._tmp.drop', function(after, before){
      // won't work when getting the same item twice?
      if (_.isEqual(after, before) || !after) return;
      var text, notes, type;
      $rootScope.playSound('Item_Drop');

      // Note: For Mystery Item gear, after.type will be 'head', 'armor', etc
      // so we use after.notificationType below.

      if (after.type !== 'gear' && after.type !== 'Quest' && after.notificationType !== 'Mystery') {
        if (after.type === 'Food') {
          type = 'food';
        } else if (after.type === 'HatchingPotion') {
          type = 'hatchingPotions';
        } else {
          type = after.type.toLowerCase() + 's';
        }
        if(!User.user.items[type][after.key]){
          User.user.items[type][after.key] = 0;
        }
        User.user.items[type][after.key]++;
      }

      if (after.type === 'HatchingPotion'){
        text = Content.hatchingPotions[after.key].text();
        notes = Content.hatchingPotions[after.key].notes();
        Notification.drop(env.t('messageDropPotion', {dropText: text, dropNotes: notes}), after);
      } else if (after.type === 'Egg'){
        text = Content.eggs[after.key].text();
        notes = Content.eggs[after.key].notes();
        Notification.drop(env.t('messageDropEgg', {dropText: text, dropNotes: notes}), after);
      } else if (after.type === 'Food'){
        text = Content.food[after.key].text();
        notes = Content.food[after.key].notes();
        Notification.drop(env.t('messageDropFood', {dropArticle: after.article, dropText: text, dropNotes: notes}), after);
      } else if (after.type === 'Quest') {
        $rootScope.selectedQuest = Content.quests[after.key];
        $rootScope.openModal('questDrop', {controller:'PartyCtrl',size:'sm'});
      } else if (after.notificationType === 'Mystery') {
        text = Content.gear.flat[after.key].text();
        Notification.drop(env.t('messageDropMysteryItem', {dropText: text}), after);
      } else {
        // Keep support for another type of drops that might be added
        Notification.drop(User.user._tmp.drop.dialog);
      }

      Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'acquire item','itemName':after.key,'acquireMethod':'Drop'});
    });

    $rootScope.$watch('user.achievements.streak', function(after, before){
      if(before == undefined || after <= before) return;
      Notification.streak(User.user.achievements.streak);
      $rootScope.playSound('Achievement_Unlocked');
      if (!User.user.preferences.suppressModals.streak) {
        $rootScope.openModal('achievements/streak', {controller:'UserCtrl'});
      }
    });

    $rootScope.$watch('user.achievements.ultimateGearSets', function(after, before){
      if (_.isEqual(after,before) || !_.contains(User.user.achievements.ultimateGearSets, true)) return;
      $rootScope.openModal('achievements/ultimateGear', {controller:'UserCtrl'});
    }, true);

    $rootScope.$watch('user.flags.armoireEmpty', function(after,before){
      if (before == undefined || after == before || after == false) return;
      $rootScope.openModal('armoireEmpty');
    });

    $rootScope.$watch('user.achievements.rebirths', function(after, before){
      if(after === before) return;
      $rootScope.openModal('achievements/rebirth', {controller:'UserCtrl', size: 'sm'});
    });

    $rootScope.$watch('user.flags.contributor', function(after, before){
      if (after === before || after !== true) return;
      $rootScope.openModal('achievements/contributor',{controller:'UserCtrl'});
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

    $rootScope.$on('responseError', function(ev, error){
      Notification.error(error);
    });
    $rootScope.$on('responseText', function(ev, error){
      Notification.text(error);
    });

    // Show new-stuff modal on load
    if (User.user.flags.newStuff)
      $rootScope.openModal('newStuff', {size:'lg'});
  }
]);
