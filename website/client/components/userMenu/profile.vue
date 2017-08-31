<template lang="pug">
div
  b-modal#profile(title="Profile", size='lg', :hide-footer="true")
    .row
      .col-6.offset-3
        button.btn.btn-secondary(@click='sendMessage()') Message
    .row
      .col-6.offset-3.text-center.nav
        .nav-item(@click='selectedPage = "profile"', :class="{active: selectedPage === 'profile'}") Profile
        .nav-item(@click='selectedPage = "stats"', :class="{active: selectedPage === 'stats'}") Stats
        .nav-item(@click='selectedPage = "achievements"', :class="{active: selectedPage === 'achievements'}") Achievements
    .standard-page(v-show='selectedPage === "profile"', v-if='user.profile')
      .row
        .col-8
          .header
            h1 {{user.profile.name}}
            h4
              strong User Id:
              | {{user._id}}
        .col-4
          button.btn.btn-secondary(v-if='user._id === userLoggedIn._id', @click='editing = !editing') Edit
      .row(v-if='!editing')
        .col-8
          .about
            h2 About
            p(v-markdown='user.profile.blurb')
          .photo
            h2 Photo
            img.img-rendering-auto(v-if='user.profile.imageUrl', :src='user.profile.imageUrl')

        .col-4
          .info
            h2 info
            div
              strong Joined:
              | {{user.auth.timestamps.created}}
            div
              strong Total Log Ins:
              span {{ $t('totalCheckins', {count: user.loginIncentives}) }}
            div
              | {{getProgressDisplay()}}
              .progress
                .progress-bar(role='progressbar', :aria-valuenow='incentivesProgress', aria-valuemin='0', aria-valuemax='100', :style='{width: incentivesProgress + "%"}')
                  span.sr-only {{ incentivesProgress }}% Complete
          // @TODO: Implement in V2 .social

      .row(v-if='editing')
        h1 Edit Profile
        .col-12
          .alert.alert-info.alert-sm(v-html='$t("communityGuidelinesWarning", managerEmail)')

          // TODO use photo-upload instead: https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/xMmADvxBOak
          .form-group
            label {{ $t('displayName') }}
            input.form-control(type='text', :placeholder="$t('fullName')", v-model='editingProfile.name')
          .form-group
            label {{ $t('photoUrl') }}
            input.form-control(type='url', v-model='editingProfile.imageUrl', :placeholder="$t('imageUrl')")
          .form-group
            label {{ $t('about') }}
            textarea.form-control(rows=5, :placeholder="$t('displayBlurbPlaceholder')", v-model='editingProfile.blurb')
            // include ../../shared/formatting-help
          //- .form-group
          //-   label Facebook
          //-   input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.facebook')
          //- .form-group
          //-   label Instagram
          //-   input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.instagram')
          //- .form-group
          //-   label Twitter
          //-   input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.twitter')

        .col-12.text-center
          button.btn.btn-primary(@click='save()') {{ $t("save") }}
          button.btn.btn-warning(@click='editing = false') {{ $t("cancel") }}

    .standard-page.container(v-show='selectedPage === "achievements"', v-if='user.achievements')
      .row(v-for='(category, key) in achievements')
        h2.col-12 {{ $t(key+'Achievs') }}
        .col-3.text-center(v-for='achievment in category.achievements')
          div.achievement-container(:data-popover-html='achievment.title + achievment.text',
            popover-placement='achievPopoverPlacement',
            popover-append-to-body='achievAppendToBody')
            div(popover-trigger='mouseenter',
              :data-popover-html='achievment.title + achievment.text',
              popover-placement='achievPopoverPlacement',
              popover-append-to-body='achievAppendToBody')
                .achievement(:class='achievment.icon + "2x"', v-if='achievment.earned')
                 .counter.badge.badge-info.stack-count(v-if='achievment.optionalCount') {{achievment.optionalCount}}
                .achievement(class='achievement-unearned2x', v-if='!achievment.earned')
      .row
        .col-6(v-if='user.achievements.challenges')
          h2 Challeges Won
          div(v-for='chal in user.achievements.challenges')
            span {{chal}}
        .col-6(v-if='user.achievements.quests')
          h2 Quests Completed
          div(v-for='(value, key) in user.achievements.quests')
            span {{ content.quests[key].text() }}
            span {{ value }}
    .standard-page(v-show='selectedPage === "stats"', v-if='user.preferences')
      .row
        .col-6
          h2.text-center Equipment
          // user.items.gear.equipped
          .well
            .col-4.item-wrapper
              .box
              h3 Eyewear
            .col-4.item-wrapper
              .box
              h3 Head Gear
            .col-4.item-wrapper
              .box
              h3 Head Access.
            .col-4.item-wrapper
              .box
              h3 Back Access.
            .col-4.item-wrapper
              .box
              h3 Armor
            .col-4.item-wrapper
              .box
              h3 Body Access.
            .col-4.item-wrapper
              .box
              h3 Main-Hand
            .col-4.item-wrapper
            .col-4.item-wrapper
              .box
              h3 Off-Hand
        .col-6
          h2.text-center Costume
          // user.items.gear.costume
          .well
            .col-4.item-wrapper
              .box
              h3 Eyewear
            .col-4.item-wrapper
              .box
              h3 Head Gear
            .col-4.item-wrapper
              .box
              h3 Head Access.
            .col-4.item-wrapper
              .box
              h3 Back Access.
            .col-4.item-wrapper
              .box
              h3 Armor
            .col-4.item-wrapper
              .box
              h3 Body Access.
            .col-4.item-wrapper
              .box
              h3 Main-Hand
            .col-4.item-wrapper
              .box
              h3 Background {{ user.preferences.background }}
            .col-4.item-wrapper
              .box
              h3 Off-Hand
      .row
        .col-6
          h2.text-center(v-once) {{ $t('pets') }}
          ul
            li(ng-if='user.items.currentPet')
              | {{ $t('activePet') }}:
              | {{ formatAnimal(user.items.currentPet, 'pet') }}
            li
              | {{ $t('petsFound') }}:
              | {{ totalCount(user.items.pets) }}
            li
              | {{ $t('beastMasterProgress') }}:
              | {{ beastMasterProgress(user.items.pets) }}
        .col-6
          h2.text-center(v-once) {{ $t('mounts') }}
          ul
            li(v-if='user.items.currentMount')
              | {{ $t('activeMount') }}:
              | {{ formatAnimal(user.items.currentMount, 'mount') }}
            li
              | {{ $t('mountsTamed') }}:
              | {{ totalCount(user.items.mounts) }}
            li
              | {{ $t('mountMasterProgress') }}:
              | {{ mountMasterProgress(user.items.mounts) }}
      .row#attributes
      hr.col-12
      h2.col-12 Attributes
      .row.col-6(v-for="(statInfo, stat) in stats")
        .col-4.attribute-label
          span.hint(:popover-title='$t(statInfo.title)', popover-placement='right',
            :popover='$t(statInfo.popover)', popover-trigger='mouseenter')
          div {{ $t(statInfo.title) }}
          strong.number {{ statsComputed[stat] }}
        .col-6
          ul.bonus-stats
            li
              strong Level:
              | {{statsComputed.levelBonus[stat]}}
            li
              strong Equipment:
              | {{statsComputed.gearBonus[stat]}}
            li
              strong Class:
              | {{statsComputed.classBonus[stat]}}
            li
              strong Allocated:
              | {{user.stats[stat]}}
            li
              strong Buffs:
              | {{user.stats.buffs[stat]}}
      // @TODO: Implement
          div
            div
              p(v-if='userLevel100Plus', v-once) {{ $t('noMoreAllocate') }}
              p(v-if='user.stats.points || userLevel100Plus')
                strong.inline
                  | {{user.stats.points}}&nbsp;
                strong.hint(popover-trigger='mouseenter',
                  popover-placement='right', :popover="$t('levelPopover')") {{ $t('unallocated') }}
            div
              fieldset.auto-allocate
                  .checkbox
                    label
                      input(type='checkbox', v-model='user.preferences.automaticAllocation',
                        @change='set({"preferences.automaticAllocation": user.preferences.automaticAllocation, "preferences.allocationMode": "taskbased"})')
                      span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('autoAllocationPop')") {{ $t('autoAllocation') }}
                  form(v-if='user.preferences.automaticAllocation', style='margin-left:1em')
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='flat', v-model='user.preferences.allocationMode',
                          @change='set({"preferences.allocationMode": "flat"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('evenAllocationPop')") {{ $t('evenAllocation') }}
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='classbased',
                          v-model='user.preferences.allocationMode', @change='set({"preferences.allocationMode": "classbased"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('classAllocationPop')") {{ $t('classAllocation') }}
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='taskbased', v-model='user.preferences.allocationMode', @change='set({"preferences.allocationMode": "taskbased"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('taskAllocationPop')") {{ $t('taskAllocation') }}
                  div(v-if='user.preferences.automaticAllocation && !(user.preferences.allocationMode === "taskbased") && (user.stats.points > 0)')
                    button.btn.btn-primary.btn-xs(@click='allocateNow({})', popover-trigger='mouseenter', popover-placement='right', :popover="$t('distributePointsPop')")
                      span.glyphicon.glyphicon-download
                      |&nbsp;
                      | {{ $t('distributePoints') }}
            .row(v-for='(statInfo, stat) in allocateStatsList')
              .col-8
                span.hint(popover-trigger='mouseenter', popover-placement='right', :popover='$t(statInfo.popover)')
                | {{ $t(statInfo.title) + user.stats[stat] }}
              .col-4(v-if='user.stats.points', @click='allocate(stat)')
                 button.btn.btn-primary(popover-trigger='mouseenter', popover-placement='right',
                  :popover='$t(statInfo.allocatepop)') +
  private-message-modal(:userIdToMessage='userIdToMessage')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header {
    h1 {
      color: #4f2a93;
    }

    h4 {
      color: #686274;
    }
  }

  .nav {
    font-weight: bold;
    height: 40px;
  }

  .nav-item {
    display: inline-block;
    margin-right: 2em;
    margin-left: 1em;
    padding: 1em;
  }

  .nav-item:hover, .nav-item.active {
    color: #4f2a93;
    border-bottom: 2px solid #4f2a93;
    cursor: pointer;
  }

  #attributes {
    .number {
      font-size: 64px;
      font-weight: bold;
      color: #686274;
    }

    .attribute-label {
      text-align: center;
    }
  }

  .well {
    background-color: #edecee;
    border-radius: 2px;
    padding: 0.4em;
    padding-top: 1em;
  }

  .item-wrapper {
    .box {
      width: 94px;
      height: 92px;
      border-radius: 2px;
      border: dotted 1px #c3c0c7;
    }

    h3 {
      text-align: center;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import each from 'lodash/each';
import { mapState } from 'client/libs/store';
import size from 'lodash/size';
import keys from 'lodash/keys';
import { beastMasterProgress, mountMasterProgress } from '../../../common/script/count';
import statsComputed from  '../../../common/script/libs/statsComputed';
import autoAllocate from '../../../common/script/fns/autoAllocate';
import allocate from  '../../../common/script/ops/allocate';

import privateMessageModal from 'client/components/private-message-modal';
import markdown from 'client/directives/markdown';
import achievementsLib from '../../../common/script/libs/achievements';
// @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';
import Content from '../../../common/script/content';
const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;

export default {
  directives: {
    markdown,
  },
  components: {
    bModal,
    privateMessageModal,
  },
  data () {
    return {
      userIdToMessage: '',
      editing: false,
      editingProfile: {
        name: '',
        imageUrl: '',
        blurb: '',
      },
      managerEmail: {
        hrefBlankCommunityManagerEmail: `<a href="mailto:${COMMUNITY_MANAGER_EMAIL}">${COMMUNITY_MANAGER_EMAIL}</a>`,
      },
      selectedPage: 'profile',
      achievements: {},
      content: Content,
      stats: {
        str: {
          title: 'strength',
          popover: 'strengthText',
        },
        int: {
          title: 'intelligence',
          popover: 'intText',
        },
        con: {
          title: 'constitution',
          popover: 'conText',
        },
        per: {
          title: 'perception',
          popover: 'perText',
        },
      },
      allocateStatsList: {
        str: { title: 'allocateStr', popover: 'strengthText', allocatepop: 'allocateStrPop' },
        int: { title: 'allocateInt', popover: 'intText', allocatepop: 'allocateIntPop' },
        con: { title: 'allocateCon', popover: 'conText', allocatepop: 'allocateConPop' },
        per: { title: 'allocatePer', popover: 'perText', allocatepop: 'allocatePerPop' },
      },
    };
  },
  computed: {
    ...mapState({
      userLoggedIn: 'user.data',
      flatGear: 'content.gear.flat',
    }),
    user () {
      let user = this.userLoggedIn;

      let profileUser = this.$store.state.profileUser;
      if (profileUser._id && profileUser._id !== this.userLoggedIn._id) {
        user = profileUser;
      }

      this.editingProfile.name = user.profile.name;
      this.editingProfile.imageUrl = user.profile.imageUrl;

      if (!user.achievements.quests) user.achievements.quests = {};
      if (!user.achievements.challenges) user.achievements.challenges = {};
      // @TODO: this common code should handle the above
      this.achievements = achievementsLib.getAchievementsForProfile(user);

      return user;
    },
    incentivesProgress () {
      return this.getIncentivesProgress();
    },
    statsComputed () {
      return statsComputed(this.user);
    },
    userLevel100Plus () {
      return this.user.stats.lvl >= 100;
    },
    classText () {
      let classTexts = {
        warrior: this.$t('warrior'),
        wizard: this.$t('mage'),
        rogue: this.$t('rogue'),
        healer: this.$t('healer'),
      };

      return classTexts[this.user.stats.class];
    },
    startingPageOption () {
      return this.$store.state.profileOptions.startingPage;
    },
  },
  watch: {
    startingPageOption () {
      this.selectedPage = this.$store.state.profileOptions.startingPage;
    },
  },
  methods: {
    sendMessage () {
      this.userIdToMessage = this.user._id;
      this.$root.$emit('show::modal', 'private-message');
    },
    getProgressDisplay () {
      // let currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      // if (!currentLoginDay) return this.$t('checkinReceivedAllRewardsMessage');
      // let nextRewardAt = currentLoginDay.nextRewardAt;
      // if (!nextRewardAt) return this.$t('moreIncentivesComingSoon');
      // // if we are on a reward day, let's show progress relative to this
      // if (currentLoginDay.reward) currentLoginDay.prevRewardKey = this.user.loginIncentives;
      // if (!currentLoginDay.prevRewardKey) currentLoginDay.prevRewardKey = 0;
      //
      // let start = this.user.loginIncentives - currentLoginDay.prevRewardKey;
      // let end = nextRewardAt - currentLoginDay.prevRewardKey;
      // return `${this.$t('checkinProgressTitle')} ${start}/${end}`;
    },
    getIncentivesProgress () {
      let currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      if (!currentLoginDay) return 0;
      let previousRewardDay = currentLoginDay.prevRewardKey;
      let nextRewardAt = currentLoginDay.nextRewardAt;
      return (this.user.loginIncentives - previousRewardDay) / (nextRewardAt - previousRewardDay) * 100;
    },
    save () {
      let values = {};

      each(this.editingProfile, (value, key) => {
        // Using toString because we need to compare two arrays (websites)
        let curVal = this.user.profile[key];
        if (!curVal || this.editingProfile[key].toString() !== curVal.toString()) {
          values[`profile.${key}`] = value;
          this.$set(this.userLoggedIn.profile, key, value);
          this.$set(this.user.profile, key, value);
        }
      });

      this.$store.dispatch('user:set', values);

      this.editing = false;
    },
    formatAnimal (animalName, type) {
      if (type === 'pet') {
        if (Content.petInfo.hasOwnProperty(animalName)) {
          return Content.petInfo[animalName].text();
        } else {
          return this.$t('noActivePet');
        }
      } else if (type === 'mount') {
        if (Content.mountInfo.hasOwnProperty(animalName)) {
          return Content.mountInfo[animalName].text();
        } else {
          return this.$t('noActiveMount');
        }
      }
    },
    formatBackground (background) {
      let bg = Content.appearances.background;

      if (bg.hasOwnProperty(background)) {
        return `${bg[background].text()} (${this.$t(bg[background].set.text)})`;
      }

      return this.$t('noBackground');
    },
    totalCount (objectToCount) {
      let total = size(objectToCount);
      return total;
    },
    beastMasterProgress (pets) {
      let dropPetsFound = beastMasterProgress(pets);
      let display = this.formatOutOfTotalDisplay(dropPetsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    mountMasterProgress (mounts) {
      let dropMountsFound = mountMasterProgress(mounts);
      let display = this.formatOutOfTotalDisplay(dropMountsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    formatOutOfTotalDisplay (stat, totalStat) {
      let display = `${stat}/${totalStat}`;
      return display;
    },
    allocate (stat) {
      allocate(this.user, stat);
    },
    allocateNow () {
      autoAllocate(this.user);
    },
  },
};
</script>
