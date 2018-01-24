<template lang="pug">
div
  b-modal#profile(title="Profile", size='lg', :hide-footer="true")
    .header(slot='modal-header')
      .profile-actions
        button.btn.btn-secondary.message-icon(@click='sendMessage()', v-b-tooltip.hover.left="$t('sendMessage')")
          .svg-icon.message-icon(v-html="icons.message")
        button.btn.btn-secondary.gift-icon(@click='openSendGemsModal()', v-b-tooltip.hover.bottom="$t('sendGems')")
          .svg-icon.gift-icon(v-html="icons.gift")
        button.btn.btn-secondary.remove-icon(v-if='user._id !== this.userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) === -1',
          @click="blockUser()", v-b-tooltip.hover.right="$t('block')")
          .svg-icon.remove-icon(v-html="icons.remove")
        button.btn.btn-secondary.positive-icon(v-if='user._id !== this.userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) !== -1',
          @click="unblockUser()", v-b-tooltip.hover.right="$t('unblock')")
          .svg-icon.positive-icon(v-html="icons.positive")
      .row
        .col-12
          member-details(:member="user")
    .row
      .col-12.col-md-6.offset-md-3.text-center.nav
        .nav-item(@click='selectPage("profile")', :class="{active: selectedPage === 'profile'}") {{ $t('profile') }}
        .nav-item(@click='selectPage("stats")', :class="{active: selectedPage === 'stats'}") {{ $t('stats') }}
        .nav-item(@click='selectPage("achievements")', :class="{active: selectedPage === 'achievements'}") {{ $t('achievements') }}
    #userProfile.standard-page(v-show='selectedPage === "profile"', v-if='user.profile')
      .row
        .col-12.col-md-8
          .header
            h1 {{user.profile.name}}
            h4
              strong {{ $t('userId') }}:
              | {{user._id}}
        .col-12.col-md-4
          button.btn.btn-secondary(v-if='user._id === userLoggedIn._id', @click='editing = !editing') {{ $t('edit') }}
      .row(v-if='!editing')
        .col-12.col-md-8
          .about
            h2 {{ $t('about') }}
            p(v-if='user.profile.blurb', v-markdown='user.profile.blurb')
            p(v-else) {{ $t('noDescription') }}
          .photo
            h2 {{ $t('photo') }}
            img.img-rendering-auto(v-if='user.profile.imageUrl', :src='user.profile.imageUrl')
            p(v-else) {{ $t('noPhoto') }}

        .col-12.col-md-4
          .info
            h2 {{ $t('info') }}
            div
              strong {{ $t('joined') }}:&nbsp;
              | {{userJoinedDate}}
            div
              strong {{ $t('latestCheckin') }}:&nbsp;
              | {{userLastLoggedIn}}
            div
              strong {{ $t('totalLogins') }}:&nbsp;
              span {{ $t('totalCheckins', {count: user.loginIncentives}) }}
            div
              | {{getProgressDisplay()}}
              .progress
                .progress-bar(role='progressbar', :aria-valuenow='incentivesProgress', aria-valuemin='0', aria-valuemax='100', :style='{width: incentivesProgress + "%"}')
                  span.sr-only {{ incentivesProgress }}% {{$t('complete')}}
          // @TODO: Implement in V2 .social

      .row(v-if='editing')
        h1 {{$t('editProfile')}}
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
    #achievements.standard-page.container(v-show='selectedPage === "achievements"', v-if='user.achievements')
      .row(v-for='(category, key) in achievements')
        h2.col-12.text-center {{ $t(key+'Achievs') }}
        .col-12.col-md-3.text-center(v-for='(achievement, key) in category.achievements')
          .box.achievement-container(:id='key + "-achievement"', :class='{"achievement-unearned": !achievement.earned}')
            b-popover(
              :target="'#' + key + '-achievement'",
              triggers="hover",
              placement="top",
            )
              h4.popover-content-title {{ achievement.title }}
              div.popover-content-text(v-html="achievement.text")
            .achievement(:class='achievement.icon + "2x"', v-if='achievement.earned')
              .counter.badge.badge-info.stack-count(v-if='achievement.optionalCount') {{achievement.optionalCount}}
            .achievement.achievement-unearned(class='achievement-unearned2x', v-if='!achievement.earned')
      hr.col-12
      .row
        .col-12.col-md-6(v-if='user.achievements.challenges')
          .achievement-icon.achievement-karaoke
          h2.text-center {{$t('challengesWon')}}
          div(v-for='chal in user.achievements.challenges')
            span(v-markdown='chal')
            hr
        .col-12.col-md-6(v-if='user.achievements.quests')
          .achievement-icon.achievement-alien
          h2.text-center {{$t('questsCompleted')}}
          div(v-for='(value, key) in user.achievements.quests')
            span {{ content.quests[key].text() }} ({{ value }})
    #stats.standard-page(v-show='selectedPage === "stats"', v-if='user.preferences')
      .row
        .col-12.col-md-6
          h2.text-center {{$t('equipment')}}
          .well
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.eyewear && equippedItems.eyewear.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.eyewear}`")
              h3 {{$t('eyewear')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.head && equippedItems.head.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.head}`")
              h3 {{$t('headgearCapitalized')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.headAccessory && equippedItems.headAccessory.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.headAccessory}`")
              h3 {{$t('headAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.back && equippedItems.back.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.back}`")
              h3 {{$t('backAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.armor && equippedItems.armor.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.armor}`")
              h3 {{$t('armorCapitalized')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.body && equippedItems.body.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.body}`")
              h3 {{$t('bodyAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.weapon && equippedItems.weapon.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.weapon}`")
              h3 {{$t('mainHand')}}
            .col-12.col-md-4.item-wrapper
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: equippedItems.shield && equippedItems.shield.indexOf("base_0") === -1}')
                div(:class="`shop_${equippedItems.shield}`")
              h3 {{$t('offHand')}}
        .col-12.col-md-6
          h2.text-center {{$t('costume')}}
          .well
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.eyewear && costumeItems.eyewear.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.eyewear}`")
              h3 {{$t('eyewear')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.head && costumeItems.head.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.head}`")
              h3 {{$t('headgearCapitalized')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.headAccessory && costumeItems.headAccessory.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.headAccessory}`")
              h3 {{$t('headAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.back && costumeItems.back.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.back}`")
              h3 {{$t('backAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.armor && costumeItems.armor.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.armor}`")
              h3 {{$t('armorCapitalized')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.body && costumeItems.body.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.body}`")
              h3 {{$t('bodyAccess')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.weapon && costumeItems.weapon.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.weapon}`")
              h3 {{$t('mainHand')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: user.preferences.background}', style="overflow:hidden")
                div(:class="'icon_background_' + user.preferences.background")
              h3 {{$t('background')}}
            .col-12.col-md-4.item-wrapper
              .box(:class='{white: costumeItems.shield && costumeItems.shield.indexOf("base_0") === -1}')
                div(:class="`shop_${costumeItems.shield}`")
              h3 {{$t('offHand')}}
      .row.pet-mount-row
        .col-12.col-md-6
          h2.text-center(v-once) {{ $t('pets') }}
          .well.pet-mount-well
            .row.col-12
              .col-12.col-md-4
                .box(:class='{white: user.items.currentPet}')
                  .pet(:class="`Pet-${user.items.currentPet}`")
              .col-12.col-md-8
                div
                  | {{ formatAnimal(user.items.currentPet, 'pet') }}
                div
                  strong {{ $t('petsFound') }}:
                  | {{ totalCount(user.items.pets) }}
                div
                  strong {{ $t('beastMasterProgress') }}:
                  | {{ beastMasterProgress(user.items.pets) }}
        .col-12.col-md-6
          h2.text-center(v-once) {{ $t('mounts') }}
          .well.pet-mount-well
            .row.col-12
              .col-12.col-md-4
                .box(:class='{white: user.items.currentMount}')
                  .mount(:class="`Mount_Icon_${user.items.currentMount}`")
              .col-12.col-md-8
                div
                  | {{ formatAnimal(user.items.currentMount, 'mount') }}
                div
                  strong {{ $t('mountsTamed') }}:
                  span {{ totalCount(user.items.mounts) }}
                div
                  strong {{ $t('mountMasterProgress') }}:
                  span {{ mountMasterProgress(user.items.mounts) }}
      #attributes.row
        hr.col-12
        h2.col-12 {{$t('attributes')}}
        .col-12.col-md-6(v-for="(statInfo, stat) in stats")
          .row.col-12.stats-column
            .col-12.col-md-4.attribute-label
              span.hint(:popover-title='$t(statInfo.title)', popover-placement='right',
                :popover='$t(statInfo.popover)', popover-trigger='mouseenter')
              .stat-title(:class='stat') {{ $t(statInfo.title) }}
              strong.number {{ statsComputed[stat] }}
            .col-12.col-md-6
              ul.bonus-stats
                li
                  strong {{$t('level')}}:
                  | {{statsComputed.levelBonus[stat]}}
                li
                  strong {{$t('equipment')}}:
                  | {{statsComputed.gearBonus[stat]}}
                li
                  strong {{$t('class')}}:
                  | {{statsComputed.classBonus[stat]}}
                li
                  strong {{$t('allocated')}}:
                  | {{user.stats[stat]}}
                li
                  strong {{$t('buffs')}}:
                  | {{user.stats.buffs[stat]}}
      #allocation(v-if='user._id === userLoggedIn._id')
        .row.title-row
          .col-12.col-md-6
            h3(v-if='userLevel100Plus', v-once, v-html="$t('noMoreAllocate')")
            h3(v-if='user.stats.points || userLevel100Plus')
              | {{$t('pointsAvailable')}}
              .counter.badge(v-if='user.stats.points || userLevel100Plus')
                | {{user.stats.points}}&nbsp;
          .col-12.col-md-6
            .float-right
              toggle-switch(:label="$t('autoAllocation')",
                v-model='user.preferences.automaticAllocation',
                @change='userset({"preferences.automaticAllocation": Boolean(user.preferences.automaticAllocation), "preferences.allocationMode": "taskbased"})')

        .row
          .col-12.col-md-3(v-for='(statInfo, stat) in allocateStatsList')
            .box.white.row.col-12
              .col-12
                div(:class='stat') {{ $t(stats[stat].title) }}
                .number {{ user.stats[stat] }}
                .points {{$t('pts')}}
              .col-12.col-md-4
                .up(v-if='user.stats.points', @click='allocate(stat)')
  send-gems-modal(:userReceivingGems='userReceivingGems')
</template>

<style lang="scss" >
  #profile {
    .member-details {
      .character-name, small, .small-text {
        color: #878190
      }
    }

    .modal-content {
      background: #f9f9f9;
    }
  }

  .message-icon svg {
    height: 16px;
  }

  .gift-icon svg {
    height: 14px;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header {
    width: 100%;
  }

  .profile-actions {
    float: right;
    margin-right: 1em;

    button {
      width: 40px;
      height: 40px;
      padding: .7em;
      margin-right: .5em;
    }
  }

  .message-icon {
    width: 16px;
    color: #686274;
  }

  .gift-icon {
    width: 14px;
    padding: 0 0 0 1px;
    color: #686274;
  }

  .remove-icon {
    width:16px;
    color: #686274;
  }

  .positive-icon {
    width: 14px;
    color: #686274;
  }

  .pet-mount-row {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .pet {
    margin-top: -1.4em !important;
  }

  .mount {
    margin-top: -0.2em !important;
  }

  .photo img {
    max-width: 100%;
  }

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
    margin: 0 auto;
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

  .well.pet-mount-well {
    padding-bottom: 1em;

    strong {
      margin-right: .2em;
    }
  }

  #achievements {
    .box {
      margin: 0 auto;
      margin-top: 1em;
      padding-top: 1.2em;
      background: #fff;
    }

    .box.achievement-unearned {
      background-color: #edecee;
    }

    h2 {
      margin-top: 1em;
    }

    .counter.badge {
      position: absolute;
      top: .5em;
      right: 3em;
      color: #fff;
      background-color: #ff944c;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
      min-width: 24px;
      min-height: 24px;
      border-radius: 2em;
      padding: .5em;
    }

    .achievement-icon {
      margin: 0 auto;
    }
  }

  .achievement {
    margin: 0 auto;
  }

  .box {
    width: 94px;
    height: 92px;
    border-radius: 2px;
    border: dotted 1px #c3c0c7;
  }

  .white {
    border-radius: 2px;
    background: #FFFFFF;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    border: 1px solid transparent;
  }

  .item-wrapper {
    h3 {
      text-align: center;
    }
  }

  #stats {
    .box div {
      margin: 0 auto;
      margin-top: 1em;
    }
  }

  .stats-column {
    border-radius: 2px;
    background-color: #ffffff;
    padding: .5em;
    margin-bottom: 1em;

    ul {
      list-style-type: none;

      li strong {
        margin-right: .3em;
      }
    }
  }

  .stat-title {
    text-transform: uppercase;
  }

  .str {
    color: #f74e52;
  }

  .int {
    color: #2995cd;
  }

  .con {
    color: #ffa623;
  }

  .per {
    color: #4f2a93;
  }

  #allocation {
    .title-row {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .counter.badge {
      position: relative;
      top: -0.25em;
      left: 0.5em;
      color: #fff;
      background-color: #ff944c;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .box {
      width: 141px;
      height: 84px;
      padding: .5em;
      margin: 0 auto;

      div {
        margin-top: 0;
      }

      .number {
        font-size: 40px;
        text-align: left;
        color: #686274;
        display: inline-block;
      }

      .points {
        display: inline-block;
        font-weight: bold;
        line-height: 1.67;
        text-align: left;
        color: #878190;
        margin-left: .5em;
      }

      .up {
        border: solid #a5a1ac;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
        margin-top: 1em;
      }

      .up:hover {
        cursor: pointer;
      }
    }
  }
</style>

<script>
import moment from 'moment';
import axios from 'axios';
import each from 'lodash/each';
import { mapState } from 'client/libs/store';
import size from 'lodash/size';
import keys from 'lodash/keys';
import { beastMasterProgress, mountMasterProgress } from '../../../common/script/count';
import statsComputed from  '../../../common/script/libs/statsComputed';
import autoAllocate from '../../../common/script/fns/autoAllocate';
import allocate from  '../../../common/script/ops/stats/allocate';

import MemberDetails from '../memberDetails';
import sendGemsModal from 'client/components/payments/sendGemsModal';
import markdown from 'client/directives/markdown';
import toggleSwitch from 'client/components/ui/toggleSwitch';
import achievementsLib from '../../../common/script/libs/achievements';
// @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';
import Content from '../../../common/script/content';
const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;

import message from 'assets/svg/message.svg';
import gift from 'assets/svg/gift.svg';
import remove from 'assets/svg/remove.svg';
import positive from 'assets/svg/positive.svg';
import dots from 'assets/svg/dots.svg';

export default {
  directives: {
    markdown,
  },
  components: {
    sendGemsModal,
    MemberDetails,
    toggleSwitch,
  },
  data () {
    return {
      icons: Object.freeze({
        message,
        remove,
        positive,
        gift,
        dots,
      }),
      userIdToMessage: '',
      userReceivingGems: '',
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
  mounted () {
    this.$root.$on('habitica:show-profile', (data) => {
      if (!data.user || !data.startingPage) return;
      // @TODO: We may be able to remove the need for store
      this.$store.state.profileUser = data.user;
      this.$store.state.profileOptions.startingPage = data.startingPage;
      this.$root.$emit('bv::show::modal', 'profile');
    });
  },
  destroyed () {
    this.$root.$off('habitica:show-profile');
  },
  computed: {
    ...mapState({
      userLoggedIn: 'user.data',
      flatGear: 'content.gear.flat',
    }),
    userJoinedDate () {
      return moment(this.user.auth.timestamps.created).format(this.userLoggedIn.preferences.dateFormat.toUpperCase());
    },
    userLastLoggedIn () {
      return moment(this.user.auth.timestamps.loggedin).format(this.userLoggedIn.preferences.dateFormat.toUpperCase());
    },
    equippedItems () {
      return this.user.items.gear.equipped;
    },
    costumeItems () {
      return this.user.items.gear.costume;
    },
    user () {
      let user = this.userLoggedIn;

      // Reset editing when user is changed. Move to watch or is this good?
      this.editing = false;

      let profileUser = this.$store.state.profileUser;
      if (profileUser._id && profileUser._id !== this.userLoggedIn._id) {
        user = profileUser;
      }

      this.editingProfile.name = user.profile.name;
      this.editingProfile.imageUrl = user.profile.imageUrl;
      this.editingProfile.blurb = user.profile.blurb;

      if (!user.achievements.quests) user.achievements.quests = {};
      if (!user.achievements.challenges) user.achievements.challenges = {};
      // @TODO: this common code should handle the above
      this.achievements = achievementsLib.getAchievementsForProfile(user);

      // @TODO For some reason markdown doesn't seem to be handling numbers or maybe undefined?
      user.profile.blurb = user.profile.blurb ? `${user.profile.blurb}` : '';
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
    selectPage (page) {
      this.selectedPage = page;
      // @TODO: rename this property?
      this.$store.state.profileOptions.startingPage = page;
    },
    sendMessage () {
      this.$root.$emit('habitica::new-inbox-message', {
        userIdToMessage: this.user._id,
        userName: this.user.profile.name,
      });
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
      allocate(this.user, {query: { stat }});
      axios.post(`/api/v3/user/allocate?stat=${stat}`);
    },
    allocateNow () {
      autoAllocate(this.user);
    },
    userset (settings) {
      this.$store.dispatch('user:set', settings);
    },
    blockUser () {
      this.userLoggedIn.inbox.blocks.push(this.user._id);
      axios.post(`/api/v3/user/block/${this.user._id}`);
    },
    unblockUser () {
      let index = this.userLoggedIn.inbox.blocks.indexOf(this.user._id);
      this.userLoggedIn.inbox.blocks.splice(index, 1);
      axios.post(`/api/v3/user/block/${this.user._id}`);
    },
    openSendGemsModal () {
      this.userReceivingGems = this.user;
      this.$root.$emit('bv::show::modal', 'send-gems');
    },
  },
};
</script>
