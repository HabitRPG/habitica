<template lang="pug">
</template>

<script>
// import moment from 'moment';

import { mapState } from 'client/libs/store';

export default {
  data () {
    // Levels that already display modals and should not trigger generic Level Up
    let unlockLevels = {
      3: 'drop system',
      10: 'class system',
      50: 'Orb of Rebirth',
    };

    // Avoid showing the same notiication more than once
    let lastShownNotifications = [];
    let alreadyReadNotification = [];

    return {
      unlockLevels,
      lastShownNotifications,
      alreadyReadNotification,
      isRunningYesterdailies: false,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    // https://stackoverflow.com/questions/42133894/vue-js-how-to-properly-watch-for-nested-properties/42134176#42134176
    baileyShouldShow () {
      return this.user.flags.newStuff;
    },
    userHp () {
      return this.user.stats.hp;
    },
    userExp () {
      return this.user.stats.exp;
    },
    userGp () {
      return this.user.stats.gp;
    },
    userMp () {
      return this.user.stats.mp;
    },
    userLvl () {
      return this.user.stats.lvl;
    },
    userClassSelect () {
      return !this.user.flags.classSelected && this.user.stats.lvl >= 10;
    },
    userNotifications () {
      return this.user.notifications;
    },
    userAchievements () {
      // @TODO: does this watch deeply?
      return this.user.achievements;
    },
    armoireEmpty () {
      return this.user.flags.armoireEmpty;
    },
    questCompleted () {
      return this.user.party.quest.completed;
    },
    invitedToQuest () {
      return this.user.party.quest.RSVPNeeded && !this.user.party.quest.completed;
    },
  },
  watch: {
    baileyShouldShow () {
      // @TODO: this.openModal('newStuff', {size:'lg'});
    },
    userHp (after, before) {
      if (after <= 0) {
        this.playSound('Death');
        // @TODO: this.openModal('death', {keyboard:false, backdrop:'static'});
      } else if (after <= 30 && !this.user.flags.warnedLowHealth) {
        // @TODO: this.openModal('lowHealth', {keyboard:false, backdrop:'static', controller:'UserCtrl', track:'Health Warning'});
      }
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;
      // @TODO: Notification.hp(after - before, 'hp');

      // @TODO: I am pretty sure we no long need this with $store
      // this.$broadcast('syncPartyRequest', {
      //   type: 'user_update',
      //   user: this.user,
      // });

      if (after < 0) this.playSound('Minus_Habit');
    },
    userExp (after, before) {
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;
      // @TODO: Notification.exp(after - before);
    },
    userGp (after, before) {
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;

      let money = after - before;
      let bonus;
      if (this.user._tmp) {
        bonus = this.user._tmp.streakBonus || 0;
      }
      // @TODO: Notification.gp(money, bonus || 0);

      //  Append Bonus
      if (money > 0 && Boolean(bonus)) {
        if (bonus < 0.01) bonus = 0.01;
        // @TODO: Notification.text("+ " + Notification.coins(bonus) + ' ' + window.env.t('streakCoins'));
        delete this.user._tmp.streakBonus;
      }
    },
    userMp (after, before) {
      if (after === before) return;
      if (!this.user.flags.classSelected || this.user.preferences.disableClasses) return;
      // let mana = after - before;
      // @TODO: Notification.mp(mana);
    },
    userLvl (after, before) {
      if (after <= before) return;
      // @TODO: Notification.lvl();
      this.playSound('Level_Up');
      if (this.user._tmp && this.user._tmp.drop && this.user._tmp.drop.type === 'Quest') return;
      if (this.unlockLevels[`${after}`]) return;
      // @TODO: if (!this.user.preferences.suppressModals.levelUp) this.openModal('levelUp', {controller:'UserCtrl', size:'sm'});
    },
    userClassSelect (after) {
      if (!after) return;
      // @TODO: this.openModal('chooseClass', {controller:'UserCtrl', keyboard:false, backdrop:'static'});
    },
    userNotifications (after) {
      if (!this.user._wrapped) return;
      if (this.user.needsCron) return;
      this.handleUserNotifications(after);
    },
    userAchievements () {
      this.playSound('Achievement_Unlocked');
    },
    armoireEmpty (after, before) {
      if (after === before || after === false) return;
      // @TODO: this.openModal('armoireEmpty');
    },
    questCompleted (after) {
      if (!after) return;
      // @TODO: this.openModal('questCompleted', {controller:'InventoryCtrl'});
    },
    invitedToQuest (after) {
      if (after !== true) return;
      // @TODO: this.openModal('questInvitation', {controller:'PartyCtrl'});
    },
  },
  async mounted () {
  },
  methods: {
    playSound () {
      // @TODO:
    },
    runYesterDailies () {
      // @TODO: Hopefully we don't need this even we load correctly
      if (this.isRunningYesterdailies) return;

      // let userLastCron = moment(this.user.lastCron).local();
      // let userDayStart = moment().startOf('day').add({ hours: this.user.preferences.dayStart });

      if (!this.user.needsCron) return;
      let dailys = this.user.dailys;

      if (!this.appLoaded) return;

      this.isRunningYesterdailies = true;

      // let yesterDay = moment().subtract('1', 'day').startOf('day').add({ hours: this.user.preferences.dayStart });
      let yesterDailies = [];
      dailys.forEach((task) => {
        if (task && task.group.approval && task.group.approval.requested) return;
        if (task.completed) return;
        // @TODO: let shouldDo = Shared.shouldDo(yesterDay, task);
        let shouldDo = false;

        if (task.yesterDaily && shouldDo) yesterDailies.push(task);
      });

      if (yesterDailies.length === 0) {
        // @TODO:
        // User.runCron().then(function () {
        //   isRunningYesterdailies = false;
        //   handleUserNotifications(this.user);
        // });
        return;
      }

      // @TODO:
      // let modalScope = this.$new();
      // modalScope.obj = this.user;
      // modalScope.taskList = yesterDailies;
      // modalScope.list = {
      //   showCompleted: false,
      //   type: 'daily',
      // };
      // modalScope.processingYesterdailies = true;
      //
      // $scope.yesterDailiesModalOpen = true;
      // $modal.open({
      //   templateUrl: 'modals/yesterDailies.html',
      //   scope: modalScope,
      //   backdrop: 'static',
      //   controller: ['$scope', 'Tasks', 'User', '$rootScope', function ($scope, Tasks, User, $rootScope) {
      //     this.$on('task:scored', function (event, data) {
      //       let task = data.task;
      //       let indexOfTask = _.findIndex($scope.taskList, function (taskInList) {
      //         return taskInList._id === task._id;
      //       });
      //       if (!$scope.taskList[indexOfTask]) return;
      //       $scope.taskList[indexOfTask].group.approval.requested = task.group.approval.requested;
      //       if ($scope.taskList[indexOfTask].group.approval.requested) return;
      //       $scope.taskList[indexOfTask].completed = task.completed;
      //     });
      //
      //     $scope.ageDailies = function () {
      //       User.runCron()
      //         .then(function () {
      //           isRunningYesterdailies = false;
      //           handleUserNotifications(this.user);
      //         });
      //     };
      //   }],
      // });
    },
    transferGroupNotification (notification) {
      if (!this.user.groupNotifications) this.user.groupNotifications = [];
      this.user.groupNotifications.push(notification);
    },
    handleUserNotifications (after) {
      if (!after || after.length === 0) return;

      let notificationsToRead = [];
      let scoreTaskNotification = [];

      this.user.groupNotifications = []; // Flush group notifictions

      after.forEach((notification) => {
        if (this.lastShownNotifications.indexOf(notification.id) !== -1) {
          return;
        }

        // Some notifications are not marked read here, so we need to fix this system
        // to handle notifications differently
        if (['GROUP_TASK_APPROVED', 'GROUP_TASK_APPROVAL'].indexOf(notification.type) === -1) {
          this.lastShownNotifications.push(notification.id);
          if (this.lastShownNotifications.length > 10) {
            this.lastShownNotifications.splice(0, 9);
          }
        }

        let markAsRead = true;
        // @TODO: Use factory function instead
        switch (notification.type) {
          case 'GUILD_PROMPT':
            if (notification.data.textletiant === -1) {
              // @TODO: this.openModal('testing');
            } else {
              // @TODO: this.openModal('testingletiant');
            }
            break;
          case 'DROPS_ENABLED':
            // @TODO: this.openModal('dropsEnabled');
            break;
          case 'REBIRTH_ENABLED':
            // @TODO: this.openModal('rebirthEnabled');
            break;
          case 'WON_CHALLENGE':
            // @TODO:
            // User.sync().then( function() {
            //   Achievement.displayAchievement('wonChallenge');
            // });
            break;
          case 'STREAK_ACHIEVEMENT':
            // @TODO: Notification.streak(this.user.achievements.streak);
            this.playSound('Achievement_Unlocked');
            if (!this.user.preferences.suppressModals.streak) {
              // @TODO: Achievement.displayAchievement('streak', {size: 'md'});
            }
            break;
          case 'ULTIMATE_GEAR_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('ultimateGear', {size: 'md'});
            break;
          case 'REBIRTH_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('rebirth');
            break;
          case 'GUILD_JOINED_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('joinedGuild', {size: 'md'});
            break;
          case 'CHALLENGE_JOINED_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('joinedChallenge', {size: 'md'});
            break;
          case 'INVITED_FRIEND_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('invitedFriend', {size: 'md'});
            break;
          case 'NEW_CONTRIBUTOR_LEVEL':
            this.playSound('Achievement_Unlocked');
            // @TODO: Achievement.displayAchievement('contributor', {size: 'md'});
            break;
          case 'CRON':
            if (notification.data) {
              // @TODO: if (notification.data.hp) Notification.hp(notification.data.hp, 'hp');
              // @TODO: if (notification.data.mp) Notification.mp(notification.data.mp);
            }
            break;
          case 'GROUP_TASK_APPROVAL':
            this.transferGroupNotification(notification);
            markAsRead = false;
            break;
          case 'GROUP_TASK_APPROVED':
            this.transferGroupNotification(notification);
            markAsRead = false;
            break;
          case 'SCORED_TASK':
            // Search if it is a read notification
            for (let i = 0; i < this.alreadyReadNotification.length; i++) {
              if (this.alreadyReadNotification[i] === notification.id) {
                markAsRead = false; // Do not let it be read again
                break;
              }
            }

            // Only process the notification if it is an unread notification
            if (markAsRead) {
              scoreTaskNotification.push(notification);

              // Add to array of read notifications
              this.alreadyReadNotification.push(notification.id);
            }
            break;
          case 'LOGIN_INCENTIVE':
            //  @TODO: Notification.showLoginIncentive(this.user, notification.data, Social.loadWidgets);
            break;
          default:
            if (notification.data.headerText && notification.data.bodyText) {
              // @TODO:
              // let modalScope = this.$new();
              // modalScope.data = notification.data;
              // this.openModal('generic', {scope: modalScope});
            } else {
              markAsRead = false; // If the notification is not implemented, skip it
            }
            break;
        }

        if (markAsRead) notificationsToRead.push(notification.id);
      });

      let userReadNotifsPromise = false;
      // @TODO: User.readNotifications(notificationsToRead);

      if (userReadNotifsPromise) {
        userReadNotifsPromise.then(() => {
          // Only run this code for scoring approved tasks
          if (scoreTaskNotification.length > 0) {
            let approvedTasks = [];
            for (let i = 0; i < scoreTaskNotification.length; i++) {
              // Array with all approved tasks
              approvedTasks.push({
                params: {
                  task: scoreTaskNotification[i].data.scoreTask,
                  direction: 'up',
                },
              });

              // Show notification of task approved
              // @TODO: Notification.markdown(scoreTaskNotification[i].data.message);
            }

            // Score approved tasks
            // TODO: User.bulkScore(approvedTasks);
          }
        });
      }

      this.user.notifications = []; // reset the notifications
    },
    // @TODO: I think I have these handled in the http interceptor
    // this.$on('responseError500', function(ev, error){
    //   Notification.error(error);
    // });
    // this.$on('responseError', function(ev, error){
    //   Notification.error(error, true);
    // });
    // this.$on('responseText', function(ev, error){
    //   Notification.text(error);
    // });
  },
};
</script>
