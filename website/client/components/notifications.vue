<template lang="pug">
div
  yesterdaily-modal(
    :yesterDailies='yesterDailies',
    @run-cron="runYesterDailiesAction()",
  )
  armoire-empty
  new-stuff
  death
  low-health
  level-up
  choose-class
  testing
  testingletiant
  rebirth-enabled
  drops-enabled
  contributor
  won-challenge
  ultimate-gear
  streak
  rebirth
  joined-guild
  joined-challenge
  invited-friend
  login-incentives(:data='notificationData')
  quest-completed
  quest-invitation
</template>

<style lang='scss'>
  .introjs-helperNumberLayer, .introjs-bullets {
    display: none;
  }

  .introjs-tooltip {
    background-image: url('~client/assets/svg/for-css/tutorial-border.svg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    height: 131px;
    min-height: 131px !important;
    width: 400px;
    max-width: 400px;

    .featured-label {
      position: absolute;
      top: -1.5em;
    }

    .npc_justin_textbox {
      position: absolute;
      right: 1em;
      top: -3.6em;
      width: 48px;
      height: 52px;
      background-image: url('~client/assets/images/justin_textbox.png');
    }
  }

  .introjs-button:hover, .introjs-button:active, .introjs-button:focus {
    background-image: none;
    background-color: #4f2a93 !important;
    color: #fff;
  }

  .introjs-tooltipbuttons {
    margin-top: 1em;
  }

  .introjs-button {
    text-shadow: none;
    text-align: center;
    display: block;
    max-width: 90px;
    font-family: Roboto;
    font-size: 14px;
    background-image: none;
    color: #fff;
    margin: 0 auto;
    padding: .8em;
    border-radius: 2px;
    background-color: #4f2a93 !important;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12) !important;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import throttle from 'lodash/throttle';

import { shouldDo } from '../../common/script/cron';
import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';
import guide from 'client/mixins/guide';

import yesterdailyModal from './yesterdailyModal';
import welcomeModal from './achievements/welcome';
import newStuff from './achievements/newStuff';
import death from './achievements/death';
import lowHealth from './achievements/lowHealth';
import levelUp from './achievements/levelUp';
import chooseClass from './achievements/chooseClass';
import armoireEmpty from './achievements/armoireEmpty';
import questCompleted from './achievements/questCompleted';
import questInvitation from './achievements/questInvitation';
import testing from './achievements/testing';
import testingletiant from './achievements/testingletiant';
import rebirthEnabled from './achievements/rebirthEnabled';
import dropsEnabled from './achievements/dropsEnabled';
import contributor from './achievements/contributor';
import invitedFriend from './achievements/invitedFriend';
import joinedChallenge from './achievements/joinedChallenge';
import joinedGuild from './achievements/joinedGuild';
import rebirth from './achievements/rebirth';
import streak from './achievements/streak';
import ultimateGear from './achievements/ultimateGear';
import wonChallenge from './achievements/wonChallenge';
import loginIncentives from './achievements/login-incentives';

export default {
  mixins: [notifications, guide],
  components: {
    yesterdailyModal,
    wonChallenge,
    ultimateGear,
    streak,
    rebirth,
    joinedGuild,
    joinedChallenge,
    invitedFriend,
    welcomeModal,
    newStuff,
    death,
    lowHealth,
    levelUp,
    chooseClass,
    armoireEmpty,
    questCompleted,
    questInvitation,
    testing,
    testingletiant,
    rebirthEnabled,
    dropsEnabled,
    contributor,
    loginIncentives,
  },
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
      yesterDailies: [],
      levelBeforeYesterdailies: 0,
      notificationData: {},
      unlockLevels,
      lastShownNotifications,
      alreadyReadNotification,
      isRunningYesterdailies: false,
      nextCron: null,
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
      if (this.user.needsCron) return;
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
    userHp (after, before) {
      if (after <= 0) {
        this.playSound('Death');
        this.$root.$emit('bv::show::modal', 'death');
        // @TODO: {keyboard:false, backdrop:'static'}
      } else if (after <= 30 && !this.user.flags.warnedLowHealth) {
        this.$root.$emit('bv::show::modal', 'low-health');
        // @TODO: {keyboard:false, backdrop:'static', controller:'UserCtrl', track:'Health Warning'}
      }
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;
      this.hp(after - before, 'hp');

      if (after < 0) this.playSound('Minus_Habit');
    },
    userExp (after, before) {
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;
      this.exp(after - before);
    },
    userGp (after, before) {
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;

      let money = after - before;
      let bonus;
      if (this.user._tmp) {
        bonus = this.user._tmp.streakBonus || 0;
      }
      this.gp(money, bonus || 0);

      //  Append Bonus
      if (money > 0 && Boolean(bonus)) {
        if (bonus < 0.01) bonus = 0.01;
        this.streak(`+ ${this.coins(bonus)}`);
        delete this.user._tmp.streakBonus;
      }
    },
    userMp (after, before) {
      if (after === before) return;
      if (!this.user.flags.classSelected || this.user.preferences.disableClasses) return;
      let mana = after - before;
      this.mp(mana);
    },
    userLvl (after, before) {
      if (after <= before || this.$store.state.isRunningYesterdailies) return;
      this.showLevelUpNotifications(after);
    },
    userClassSelect (after) {
      if (!after) return;
      this.$root.$emit('bv::show::modal', 'choose-class');
      // @TODO: {controller:'UserCtrl', keyboard:false, backdrop:'static'}
    },
    userNotifications (after) {
      if (this.user.needsCron) return;
      this.handleUserNotifications(after);
    },
    armoireEmpty (after, before) {
      if (after === before || after === false) return;
      this.$root.$emit('bv::show::modal', 'armoire-empty');
    },
    questCompleted () {
      if (!this.questCompleted) return;
      this.$root.$emit('bv::show::modal', 'quest-completed');
      this.playSound('Achievement_Unlocked');
    },
    invitedToQuest (after) {
      if (after !== true) return;
      this.$root.$emit('bv::show::modal', 'quest-invitation');
    },
  },
  mounted () {
    Promise.all([
      this.$store.dispatch('user:fetch'),
      this.$store.dispatch('tasks:fetchUserTasks'),
    ]).then(() => {
      this.checkUserAchievements();

      // @TODO: This is a timeout to ensure dom is loaded
      window.setTimeout(() => {
        this.initTour();
        if (this.user.flags.tour.intro === this.TOUR_END || !this.user.flags.welcomed) return;
        this.goto('intro', 0);
      }, 2000);

      this.runYesterDailies();

      // Do not remove the event listener as it's live for the entire app lifetime
      document.addEventListener('mousemove', () => this.checkNextCron());
      document.addEventListener('touchstart', () => this.checkNextCron());
      document.addEventListener('mousedown', () => this.checkNextCron());
      document.addEventListener('keydown', () => this.checkNextCron());
    });
  },
  methods: {
    checkUserAchievements () {
      if (this.user.needsCron) return;

      // List of prompts for user on changes. Sounds like we may need a refactor here, but it is clean for now
      if (!this.user.flags.welcomed) {
        this.$store.state.avatarEditorOptions.editingUser = false;
        this.$root.$emit('bv::show::modal', 'avatar-modal');
      }

      if (this.user.stats.hp <= 0) {
        this.playSound('Death');
        this.$root.$emit('bv::show::modal', 'death');
      }

      if (this.questCompleted) {
        this.$root.$emit('bv::show::modal', 'quest-completed');
        this.playSound('Achievement_Unlocked');
      }

      if (this.userClassSelect) {
        this.$root.$emit('bv::show::modal', 'choose-class');
        this.playSound('Achievement_Unlocked');
      }
    },
    showLevelUpNotifications (newlevel) {
      this.lvl();
      this.playSound('Level_Up');
      if (this.user._tmp && this.user._tmp.drop && this.user._tmp.drop.type === 'Quest') return;
      if (this.unlockLevels[`${newlevel}`]) return;
      if (!this.user.preferences.suppressModals.levelUp) this.$root.$emit('bv::show::modal', 'level-up');
    },
    playSound (sound) {
      this.$root.$emit('playSound', sound);
    },
    checkNextCron: throttle(function checkNextCron () {
      if (!this.$store.state.isRunningYesterdailies && this.nextCron && Date.now() > this.nextCron) {
        Promise.all([
          this.$store.dispatch('user:fetch', {forceLoad: true}),
          this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
        ]).then(() => this.runYesterDailies());
      }
    }, 1000),
    scheduleNextCron () {
      // Reset the yesterDailies array
      this.yesterDailies = [];

      // Open yesterdailies modal the next time cron runs
      const dayStart = this.user.preferences.dayStart;
      let nextCron = moment().hours(dayStart).minutes(0).seconds(0).milliseconds(0);

      const currentHour = moment().format('H');
      if (currentHour >= dayStart) {
        nextCron = nextCron.add(1, 'day');
      }

      // Setup a listener that executes 10 seconds after the next cron time
      this.nextCron = Number(nextCron.format('x'));
      this.$store.state.isRunningYesterdailies = false;
    },
    async runYesterDailies () {
      if (this.$store.state.isRunningYesterdailies) return;
      this.$store.state.isRunningYesterdailies = true;

      if (!this.user.needsCron) {
        this.scheduleNextCron();
        this.handleUserNotifications(this.user.notifications);
        return;
      }

      let dailys = this.$store.state.tasks.data.dailys;

      let yesterDay = moment().subtract('1', 'day').startOf('day').add({
        hours: this.user.preferences.dayStart,
      });

      dailys.forEach((task) => {
        if (task && task.group.approval && task.group.approval.requested) return;
        if (task.completed) return;
        let due = shouldDo(yesterDay, task);
        if (task.yesterDaily && due) this.yesterDailies.push(task);
      });

      if (this.yesterDailies.length === 0) {
        this.runYesterDailiesAction();
        return;
      }

      this.levelBeforeYesterdailies = this.user.stats.lvl;
      this.$root.$emit('bv::show::modal', 'yesterdaily');
    },
    async runYesterDailiesAction () {
      // Run Cron
      await axios.post('/api/v3/cron');

      // Notifications

      // Sync
      await Promise.all([
        this.$store.dispatch('user:fetch', {forceLoad: true}),
        this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
      ]);

      this.$store.state.isRunningYesterdailies = false;

      if (this.levelBeforeYesterdailies > 0 && this.levelBeforeYesterdailies < this.user.stats.lvl) {
        this.showLevelUpNotifications(this.user.stats.lvl);
      }

      this.scheduleNextCron();
      this.handleUserNotifications(this.user.notifications);
    },
    transferGroupNotification (notification) {
      this.$store.state.groupNotifications.push(notification);
    },
    async handleUserNotifications (after) {
      if (this.$store.state.isRunningYesterdailies) return;

      if (this.user.flags.newStuff) {
        this.$root.$emit('bv::show::modal', 'new-stuff');
      }

      if (!after || after.length === 0 || !Array.isArray(after)) return;

      let notificationsToRead = [];
      let scoreTaskNotification = [];

      this.$store.state.groupNotifications = []; // Flush group notifictions

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
            // @TODO: I'm pretty sure we can find better names for these
            if (notification.data.textletiant === -1) {
              this.$root.$emit('bv::show::modal', 'testing');
            } else {
              this.$root.$emit('bv::show::modal', 'testingletiant');
            }
            break;
          case 'DROPS_ENABLED':
            this.$root.$emit('bv::show::modal', 'drops-enabled');
            break;
          case 'REBIRTH_ENABLED':
            this.$root.$emit('bv::show::modal', 'rebirth-enabled');
            break;
          case 'WON_CHALLENGE':
            this.$root.$emit('bv::show::modal', 'won-challenge');
            break;
          case 'STREAK_ACHIEVEMENT':
            this.streak(this.user.achievements.streak);
            this.playSound('Achievement_Unlocked');
            if (!this.user.preferences.suppressModals.streak) {
              this.$root.$emit('bv::show::modal', 'streak');
            }
            break;
          case 'ULTIMATE_GEAR_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'ultimate-gear');
            break;
          case 'REBIRTH_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'rebirth');
            break;
          case 'GUILD_JOINED_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'joined-guild');
            break;
          case 'CHALLENGE_JOINED_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'joined-challenge');
            break;
          case 'INVITED_FRIEND_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'invited-friend');
            break;
          case 'NEW_CONTRIBUTOR_LEVEL':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'contributor');
            break;
          case 'CRON':
            if (notification.data) {
              if (notification.data.hp) this.hp(notification.data.hp, 'hp');
              if (notification.data.mp) this.mp(notification.data.mp);
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
            if (this.user.flags.tour.intro === this.TOUR_END && this.user.flags.welcomed) {
              this.notificationData = notification.data;
              this.$root.$emit('bv::show::modal', 'login-incentives');
            }
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

      if (notificationsToRead.length > 0) {
        await axios.post('/api/v3/notifications/read', {
          notificationIds: notificationsToRead,
        });
      }

      if (userReadNotifsPromise) {
        userReadNotifsPromise.then(() => {
          // Only run this code for scoring approved tasks
          if (scoreTaskNotification.length > 0) {
            let approvedTasks = [];
            for (let i = 0; i < scoreTaskNotification.length; i++) {
              // Array with all approved tasks
              const scoreData = scoreTaskNotification[i].data;
              let direction = 'up';
              if (scoreData.direction) direction = scoreData.direction;

              approvedTasks.push({
                params: {
                  task: scoreData.scoreTask,
                  direction,
                },
              });

              // Show notification of task approved
              this.markdown(scoreTaskNotification[i].data.message);
            }

            // Score approved tasks
            // TODO: User.bulkScore(approvedTasks);
          }
        });
      }

      this.user.notifications = []; // reset the notifications

      this.checkUserAchievements();
    },
  },
};
</script>
