<template>
  <div>
    <yesterdaily-modal
      :yester-dailies="yesterDailies"
      :cron-action="runCronAction"
      @hidden="afterYesterdailies()"
    />
    <armoire-empty />
    <new-stuff />
    <death />
    <low-health />
    <level-up />
    <choose-class />
    <rebirth-enabled />
    <contributor />
    <won-challenge />
    <ultimate-gear />
    <streak />
    <rebirth />
    <joined-guild />
    <joined-challenge />
    <invited-friend />
    <login-incentives :data="notificationData" />
    <quest-completed />
    <quest-invitation />
    <verify-username />
    <generic-achievement
      v-if="notificationData && notificationData.achievement"
      :data="notificationData"
    />
    <onboarding-complete />
    <first-drops />
    <group-plans-update />
  </div>
</template>

<style lang='scss'>
  .introjs-helperNumberLayer, .introjs-bullets, .introjs-skipbutton {
    display: none;
  }

  .introjs-tooltip {
    border-style: solid;
    border-width: 2px;
    border-color: #FFA623;
    outline-style: solid;
    outline-width: 2px;
    outline-color: #B36213;
    margin: 2px;
    position: relative;

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
      top: -55px;
      width: 48px;
      height: 51px;
      background-image: url('~@/assets/images/justin_textbox.png');
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

  .introjs-donebutton.btn-primary {
    color: #fff;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import Vue from 'vue';

import { toNextLevel } from '@/../../common/script/statHelpers';
import { shouldDo } from '@/../../common/script/cron';
import { onOnboardingComplete } from '@/../../common/script/libs/onboarding';
import { mapState } from '@/libs/store';
import { MAX_LEVEL_HARD_CAP } from '@/../../common/script/constants';
import notifications from '@/mixins/notifications';
import guide from '@/mixins/guide';
import { CONSTANTS, setLocalSetting } from '@/libs/userlocalManager';
import * as Analytics from '@/libs/analytics';

import yesterdailyModal from './tasks/yesterdailyModal';
import newStuff from './news/modal';
import death from './achievements/death';
import lowHealth from './achievements/lowHealth';
import levelUp from './achievements/levelUp';
import chooseClass from './achievements/chooseClass';
import armoireEmpty from './achievements/armoireEmpty';
import questCompleted from './achievements/questCompleted';
import questInvitation from './achievements/questInvitation';
import rebirthEnabled from './achievements/rebirthEnabled';
import contributor from './achievements/contributor';
import invitedFriend from './achievements/invitedFriend';
import joinedChallenge from './achievements/joinedChallenge';
import joinedGuild from './achievements/joinedGuild';
import rebirth from './achievements/rebirth';
import streak from './achievements/streak';
import ultimateGear from './achievements/ultimateGear';
import wonChallenge from './achievements/wonChallenge';
import genericAchievement from './achievements/genericAchievement';
import loginIncentives from './achievements/login-incentives';
import onboardingComplete from './achievements/onboardingComplete';
import verifyUsername from './settings/verifyUsername';
import firstDrops from './achievements/firstDrops';
import groupPlansUpdate from './group-plans/groupPlansUpdateModal';

const NOTIFICATIONS = {
  // general notifications
  NEW_CONTRIBUTOR_LEVEL: {
    achievement: true,
    label: $t => $t('modalContribAchievement'),
    modalId: 'contributor',
    sticky: true,
  },
  // achievement notifications
  ACHIEVEMENT: { // null data filled in handleUserNotifications
    achievement: true,
    modalId: 'generic-achievement',
    label: null,
    data: {
      message: $t => $t('achievement'),
      modalText: null,
    },
  },
  CHALLENGE_JOINED_ACHIEVEMENT: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('joinedChallenge')}`,
    modalId: 'joined-challenge',
  },
  GUILD_JOINED_ACHIEVEMENT: {
    label: $t => `${$t('achievement')}: ${$t('joinedGuild')}`,
    achievement: true,
    modalId: 'joined-guild',
  },
  INVITED_FRIEND_ACHIEVEMENT: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('invitedFriend')}`,
    modalId: 'invited-friend',
  },
  ACHIEVEMENT_PARTY_ON: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementPartyOn')}`,
    modalId: 'generic-achievement',
    data: {
      message: $t => $t('achievement'),
      modalText: $t => $t('achievementPartyOn'),
      achievement: 'partyOn',
    },
  },
  ACHIEVEMENT_PARTY_UP: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementPartyUp')}`,
    modalId: 'generic-achievement',
    data: {
      message: $t => $t('achievement'),
      modalText: $t => $t('achievementPartyUp'),
      achievement: 'partyUp',
    },
  },
  ULTIMATE_GEAR_ACHIEVEMENT: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('gearAchievementNotification')}`,
    modalId: 'ultimate-gear',
  },
  ACHIEVEMENT_STABLE: {
    achievement: true,
    modalId: 'generic-achievement',
    data: {
      achievement: 'stableAchievs',
    },
  },
  ACHIEVEMENT_QUESTS: {
    achievement: true,
    modalId: 'generic-achievement',
    data: {
      achievement: 'questSeriesAchievs',
    },
  },
  ACHIEVEMENT_ANIMAL_SET: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementAnimalSet')}`,
    modalId: 'generic-achievement',
    data: {
      achievement: 'animalSetAchievs',
    },
  },
  ACHIEVEMENT_PET_COLOR: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementPetColor')}`,
    modalId: 'generic-achievement',
    data: {
      achievement: 'petColorAchievs',
    },
  },
  ACHIEVEMENT_MOUNT_COLOR: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementMountColor')}`,
    modalId: 'generic-achievement',
    data: {
      achievement: 'mountColorAchievs',
    },
  },
  ACHIEVEMENT_PET_SET_COMPLETE: {
    achievement: true,
    label: $t => `${$t('achievement')}: ${$t('achievementPetSetComplete')}`,
    modalId: 'generic-achievement',
    data: {
      achievement: 'petSetCompleteAchievs',
    },
  },
};

export default {
  components: {
    yesterdailyModal,
    wonChallenge,
    ultimateGear,
    streak,
    rebirth,
    joinedGuild,
    joinedChallenge,
    invitedFriend,
    newStuff,
    death,
    lowHealth,
    levelUp,
    chooseClass,
    armoireEmpty,
    questCompleted,
    questInvitation,
    rebirthEnabled,
    contributor,
    loginIncentives,
    verifyUsername,
    genericAchievement,
    onboardingComplete,
    firstDrops,
    groupPlansUpdate,
  },
  mixins: [notifications, guide],
  data () {
    // Levels that already display modals and should not trigger generic Level Up
    const unlockLevels = {
      10: 'Class system',
      50: 'Orb of Rebirth',
    };

    // Avoid showing the same notiication more than once
    const lastShownNotifications = [];
    const alreadyReadNotification = [];

    // A list of notifications handled by this component,
    // NOTE: Those not listed here won't be handled at all!
    const handledNotifications = {};

    [
      // general notifications
      'CRON',
      'FIRST_DROPS',
      'LOGIN_INCENTIVE',
      'NEW_CONTRIBUTOR_LEVEL',
      'ONBOARDING_COMPLETE',
      'REBIRTH_ENABLED',
      'WON_CHALLENGE',
      // achievement notifications
      'ACHIEVEMENT',
      'CHALLENGE_JOINED_ACHIEVEMENT',
      'GUILD_JOINED_ACHIEVEMENT',
      'INVITED_FRIEND_ACHIEVEMENT',
      'ACHIEVEMENT_PARTY_ON',
      'ACHIEVEMENT_PARTY_UP',
      'REBIRTH_ACHIEVEMENT',
      'STREAK_ACHIEVEMENT',
      'ULTIMATE_GEAR_ACHIEVEMENT',
      'ACHIEVEMENT_STABLE',
      'ACHIEVEMENT_QUESTS',
      'ACHIEVEMENT_ANIMAL_SET',
      'ACHIEVEMENT_PET_COLOR',
      'ACHIEVEMENT_MOUNT_COLOR',
      'ACHIEVEMENT_PET_SET_COMPLETE',
    ].forEach(type => {
      handledNotifications[type] = true;
    });

    return {
      yesterDailies: [],
      levelBeforeYesterdailies: 0,
      notificationData: {},
      unlockLevels,
      lastShownNotifications,
      alreadyReadNotification,
      nextCron: null,
      handledNotifications,
    };
  },
  computed: {
    // https://stackoverflow.com/questions/42133894/vue-js-how-to-properly-watch-for-nested-properties/42134176#42134176
    ...mapState({
      user: 'user.data',
      userHp: 'user.data.stats.hp',
      userGp: 'user.data.stats.gp',
      userMp: 'user.data.stats.mp',
      userNotifications: 'user.data.notifications',
      userAchievements: 'user.data.achievements', // @TODO: does this watch deeply?
      armoireEmpty: 'user.data.flags.armoireEmpty',
      questCompleted: 'user.data.party.quest.completed',
    }),
    userClassSelect () {
      return !this.user.flags.classSelected && this.user.stats.lvl >= 10;
    },
    userHasClass () {
      return this.$store.getters['members:hasClass'](this.user);
    },
    invitedToQuest () {
      return this.user.party.quest.RSVPNeeded && !this.user.party.quest.completed;
    },
    userExpAndLvl () {
      return [this.user.stats.exp, this.user.stats.lvl];
    },
  },
  watch: {
    userHp (after, before) {
      if (this.user.needsCron) return;
      if (after <= 0) {
        this.showDeathModal();
        // @TODO: {keyboard:false, backdrop:'static'}
      } else if (after <= 30 && !this.user.flags.warnedLowHealth) {
        this.$root.$emit('bv::show::modal', 'low-health');
        // @TODO: {keyboard:false, backdrop:'static', controller:'UserCtrl'}
      }
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;
      this.hp(after - before, 'hp');

      if (after < 0) this.playSound('Minus_Habit');
    },
    userGp (after, before) {
      if (after === before) return;
      if (this.user.stats.lvl === 0) return;

      const money = after - before;
      let bonus;
      // NOTE: the streak bonus snackbar
      // is not shown when bulk scoring (for example in the RYA modal)
      // is used as it bypass the client side scoring
      // and doesn't populate the _tmp object
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
      if (!this.userHasClass) return;

      const mana = after - before;
      this.mp(mana);
    },
    userClassSelect (after) {
      if (this.user.needsCron) return;
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
    userExpAndLvl (after, before) {
      this.displayUserExpAndLvlNotifications(after[0], before[0], after[1], before[1]);
    },
  },
  mounted () {
    Promise.all([
      this.$store.dispatch('user:fetch'),
      this.$store.dispatch('tasks:fetchUserTasks'),
    ]).then(() => {
      // @TODO: This is a timeout to ensure dom is loaded
      window.setTimeout(() => {
        this.runForcedModals();
      }, 2000);

      this.debounceCheckUserAchievements();

      // Do not remove the event listener as it's live for the entire app lifetime
      document.addEventListener('mousemove', this.checkNextCron);
      document.addEventListener('touchstart', this.checkNextCron);
      document.addEventListener('mousedown', this.checkNextCron);
      document.addEventListener('keydown', this.checkNextCron);
    });
  },
  beforeDestroy () {
    document.removeEventListener('mousemove', this.checkNextCron);
    document.removeEventListener('touchstart', this.checkNextCron);
    document.removeEventListener('mousedown', this.checkNextCron);
    document.removeEventListener('keydown', this.checkNextCron);
  },
  methods: {
    runForcedModals () {
      if (!this.user.flags.verifiedUsername) return this.$root.$emit('bv::show::modal', 'verify-username');

      return this.runYesterDailies();
    },
    showDeathModal () {
      this.playSound('Death');
      this.$root.$emit('bv::show::modal', 'death');
    },
    showNotificationWithModal (notification, forceToModal) {
      const config = NOTIFICATIONS[notification.type];

      if (!config) {
        return;
      }
      if (config.achievement) {
        this.playSound('Achievement_Unlocked');
      } else if (config.sound) {
        this.playSound(config.sound);
      }

      let data = {};
      if (notification.data) {
        data = notification.data;
      }

      if (!data.modalText && config && config.data && config.data.modalText) {
        data.modalText = config.data.modalText(this.$t);
      }
      if (!data.message && config && config.data && config.data.message) {
        data.message = config.data.message(this.$t);
      }

      this.notificationData = data;
      if (forceToModal) {
        this.$root.$emit('bv::show::modal', config.modalId);
      } else {
        this.text(config.label(this.$t), () => {
          this.notificationData = data;
          this.$root.$emit('bv::show::modal', config.modalId);
        }, !config.sticky, 10000);
      }
    },
    debounceCheckUserAchievements: debounce(function debounceCheck () {
      this.checkUserAchievements();
    }, 700),
    displayUserExpAndLvlNotifications (afterExp, beforeExp, afterLvl, beforeLvl) {
      if (afterExp === beforeExp && afterLvl === beforeLvl) return;

      // XP evaluation
      if (afterExp !== beforeExp) {
        if (this.user.stats.lvl === 0) return;

        const lvlUps = afterLvl - beforeLvl;
        let exp = afterExp - beforeExp;

        if (lvlUps > 0 || afterLvl >= MAX_LEVEL_HARD_CAP) {
          let level = Math.trunc(beforeLvl);
          exp += toNextLevel(level);

          // loop if more than 1 lvl up
          for (let i = 1; i < lvlUps; i += 1) {
            level += 1;
            exp += toNextLevel(level);
          }
        }
        this.exp(exp);
      }

      // Lvl evaluation
      // @TODO use LEVELED_UP notification, would remove the need to check for yesterdailies
      if (afterLvl !== beforeLvl) {
        if (afterLvl <= beforeLvl || this.$store.state.isRunningYesterdailies) return;
        this.showLevelUpNotifications(afterLvl);
      }
    },
    checkUserAchievements () {
      if (this.user.needsCron) return null;

      // List of prompts for user on changes.
      // Sounds like we may need a refactor here, but it is clean for now
      if (!this.user.flags.welcomed) {
        if (this.$store.state.avatarEditorOptions) {
          this.$store.state.avatarEditorOptions.editingUser = false;
        }
        return this.$root.$emit('bv::show::modal', 'avatar-modal');
      }

      if (this.user.flags.newStuff) {
        return this.$root.$emit('bv::show::modal', 'new-stuff');
      }

      if (this.user.stats.hp <= 0) {
        return this.showDeathModal();
      }

      if (this.questCompleted) {
        this.playSound('Achievement_Unlocked');
        return this.$root.$emit('bv::show::modal', 'quest-completed');
      }

      if (this.userClassSelect) {
        this.playSound('Achievement_Unlocked');
        return this.$root.$emit('bv::show::modal', 'choose-class');
      }

      return null;
    },
    showLevelUpNotifications (newlevel) {
      this.lvl();
      this.playSound('Level_Up');
      if (this.unlockLevels[newlevel]) return;
      if (!this.user.preferences.suppressModals.levelUp) this.$root.$emit('bv::show::modal', 'level-up');
    },
    playSound (sound) {
      this.$root.$emit('playSound', sound);
    },
    checkNextCron: throttle(function checkNextCron () {
      if (
        !this.$store.state.isRunningYesterdailies
        && this.nextCron
        && Date.now() > this.nextCron
      ) {
        Promise.all([
          this.$store.dispatch('user:fetch', { forceLoad: true }),
          this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true }),
        ]).then(() => this.runYesterDailies());
      }
    }, 1000),
    scheduleNextCron () {
      // Reset the yesterDailies array
      this.yesterDailies = [];

      // Open yesterdailies modal the next time cron runs
      const { dayStart } = this.user.preferences;
      let nextCron = moment().hours(dayStart).minutes(0).seconds(0)
        .milliseconds(0);

      const currentHour = moment().format('H');
      if (currentHour >= dayStart) {
        nextCron = nextCron.add(1, 'day');
      }

      // Setup a listener that executes 10 seconds after the next cron time
      this.nextCron = Number(nextCron.format('x'));
    },
    async runYesterDailies () {
      if (this.$store.state.isRunningYesterdailies) return;
      this.$store.state.isRunningYesterdailies = true;

      if (!this.user.needsCron) {
        this.afterYesterdailies();
        return;
      }

      const { dailys } = this.$store.state.tasks.data;

      const yesterDay = moment().subtract('1', 'day').startOf('day').add({
        hours: this.user.preferences.dayStart,
      });

      const yesterUtcOffset = yesterDay.utcOffset();

      dailys.forEach(task => {
        if (task.group && task.group.id) return;
        if (task.completed) return;
        const due = shouldDo(yesterDay, task, { timezoneUtcOffset: yesterUtcOffset });
        if (task.yesterDaily && due) this.yesterDailies.push(task);
      });

      if (this.yesterDailies.length === 0) {
        await this.runCronAction();
        this.afterYesterdailies();
      } else {
        this.levelBeforeYesterdailies = this.user.stats.lvl;
        this.$root.$emit('bv::show::modal', 'yesterdaily');
      }
    },
    async runCronAction () {
      // Run Cron
      const response = await axios.post('/api/v4/cron');
      if (response.status === 200) {
        // Reset daily analytics actions
        setLocalSetting(CONSTANTS.keyConstants.TASKS_SCORED_COUNT, 0);
        setLocalSetting(CONSTANTS.keyConstants.TASKS_CREATED_COUNT, 0);
      } else {
        // Note a failed cron event, for our records and investigation
        Analytics.track({
          eventName: 'cron failed',
          eventAction: 'cron failed',
          eventCategory: 'behavior',
          hitType: 'event',
          responseCode: response.status,
        }, { trackOnClient: true });
      }

      // Sync
      await Promise.all([
        this.$store.dispatch('user:fetch', { forceLoad: true }),
        this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true }),
      ]);
    },
    afterYesterdailies () {
      this.scheduleNextCron();
      this.$store.state.isRunningYesterdailies = false;

      if (
        this.levelBeforeYesterdailies > 0
        && this.levelBeforeYesterdailies < this.user.stats.lvl
      ) {
        this.showLevelUpNotifications(this.user.stats.lvl);
      }
      this.handleUserNotifications(this.user.notifications);
    },
    async handleUserNotifications (after) {
      if (this.$store.state.isRunningYesterdailies) return;

      if (!after || after.length === 0 || !Array.isArray(after)) return;

      const notificationsToRead = [];

      after.forEach(notification => {
        // This notification type isn't implemented here
        if (!this.handledNotifications[notification.type]) return;

        if (this.lastShownNotifications.indexOf(notification.id) !== -1) {
          return;
        }

        this.lastShownNotifications.push(notification.id);
        if (this.lastShownNotifications.length > 10) {
          this.lastShownNotifications.splice(0, 9);
        }

        let markAsRead = true;

        // @TODO: Use factory function instead
        switch (notification.type) { // eslint-disable-line default-case
          case 'FIRST_DROPS':
            if (notification.data) {
              this.$store.state.firstDropsOptions.egg = notification.data.egg;
              this.$store.state.firstDropsOptions.hatchingPotion = notification.data.hatchingPotion;
              this.$root.$emit('bv::show::modal', 'first-drops');
            }
            break;
          case 'REBIRTH_ENABLED':
            this.$root.$emit('bv::show::modal', 'rebirth-enabled');
            break;
          case 'WON_CHALLENGE':
            this.$root.$emit('habitica:won-challenge', notification);
            break;
          case 'REBIRTH_ACHIEVEMENT':
            this.playSound('Achievement_Unlocked');
            this.$root.$emit('bv::show::modal', 'rebirth');
            break;
          case 'STREAK_ACHIEVEMENT':
            this.text(`${this.$t('streaks')}: ${this.user.achievements.streak}`, () => {
              this.$root.$emit('bv::show::modal', 'streak');
            }, this.user.preferences.suppressModals.streak);
            this.playSound('Achievement_Unlocked');
            break;
          case 'NEW_CONTRIBUTOR_LEVEL':
          case 'CHALLENGE_JOINED_ACHIEVEMENT':
          case 'GUILD_JOINED_ACHIEVEMENT':
          case 'INVITED_FRIEND_ACHIEVEMENT':
          case 'ACHIEVEMENT_PARTY_ON':
          case 'ACHIEVEMENT_PARTY_UP':
          case 'ULTIMATE_GEAR_ACHIEVEMENT':
            this.showNotificationWithModal(notification);
            break;
          case 'ACHIEVEMENT_QUESTS': {
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT_QUESTS.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT_STABLE': {
            const { achievement, achievementNotification } = notification.data;
            NOTIFICATIONS.ACHIEVEMENT_STABLE.label = $t => `${$t('achievement')}: ${$t(achievementNotification)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT_ANIMAL_SET': {
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT_ANIMAL_SET.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT_PET_COLOR': {
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT_PET_COLOR.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT_MOUNT_COLOR': {
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT_MOUNT_COLOR.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT_PET_SET_COMPLETE': {
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT_PET_SET_COMPLETE.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            this.showNotificationWithModal(notification);
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'ACHIEVEMENT': { // generic achievement
            const { achievement } = notification.data;
            const upperCaseAchievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
            const achievementTitleKey = `achievement${upperCaseAchievement}`;
            NOTIFICATIONS.ACHIEVEMENT.label = $t => `${$t('achievement')}: ${$t(achievementTitleKey)}`;
            NOTIFICATIONS.ACHIEVEMENT.data.modalText = $t => $t(achievementTitleKey);
            this.showNotificationWithModal(notification);

            // Set the achievement as it's not defined in the user schema
            Vue.set(this.user.achievements, achievement, true);
            break;
          }
          case 'LOGIN_INCENTIVE':
            if (this.user.flags.tour.intro === this.TOUR_END && this.user.flags.welcomed) {
              this.notificationData = notification.data;
              this.$root.$emit('bv::show::modal', 'login-incentives');
            }
            break;
          case 'ONBOARDING_COMPLETE':
            // Award rewards
            onOnboardingComplete(this.user);

            // If the user cronned in the last 3 minutes
            // Don't show too many modals on app load
            // Use notification panel
            if (moment().diff(this.user.lastCron, 'minutes') < 3) {
              markAsRead = false;
            } else {
              // Otherwise use the modal
              this.$root.$emit('bv::show::modal', 'onboarding-complete');
            }
            break;
        }

        if (markAsRead) notificationsToRead.push(notification.id);
      });

      if (notificationsToRead.length > 0) {
        await axios.post('/api/v4/notifications/read', {
          notificationIds: notificationsToRead,
        });
      }

      this.debounceCheckUserAchievements();
    },
  },
};
</script>
