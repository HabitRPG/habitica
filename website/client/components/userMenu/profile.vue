<template lang="pug">
.profile(v-if='user')
  .header
    .profile-actions
      button.btn.btn-secondary.message-icon(@click='sendMessage()', v-b-tooltip.hover.left="$t('sendMessage')")
        .svg-icon.message-icon(v-html="icons.message")
      button.btn.btn-secondary.gift-icon(@click='openSendGemsModal()', v-b-tooltip.hover.bottom="$t('sendGems')")
        .svg-icon.gift-icon(v-html="icons.gift")
      button.btn.btn-secondary.remove-icon(v-if='user._id !== this.userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) === -1',
        @click="blockUser()", v-b-tooltip.hover.right="$t('blockWarning')")
        .svg-icon.remove-icon(v-html="icons.remove")
      button.btn.btn-secondary.positive-icon(v-if='user._id !== this.userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) !== -1',
        @click="unblockUser()", v-b-tooltip.hover.right="$t('unblock')")
        .svg-icon.positive-icon(v-html="icons.positive")
      button.btn.btn-secondary.positive-icon(v-if='this.userLoggedIn.contributor.admin && !adminToolsLoaded',
        @click="loadAdminTools()", v-b-tooltip.hover.right="'Admin - Load Tools'")
        .svg-icon.positive-icon(v-html="icons.staff")
      span(v-if='this.userLoggedIn.contributor.admin && adminToolsLoaded')
        button.btn.btn-secondary.positive-icon(v-if='!hero.flags || (hero.flags && !hero.flags.chatRevoked)',
          @click="adminRevokeChat()", v-b-tooltip.hover.bottom="'Admin - Revoke Chat Privileges'")
          .svg-icon.positive-icon(v-html="icons.megaphone")
        button.btn.btn-secondary.positive-icon(v-if='hero.flags && hero.flags.chatRevoked',
          @click="adminReinstateChat()", v-b-tooltip.hover.bottom="'Admin - Reinstate Chat Privileges'")
          .svg-icon.positive-icon(v-html="icons.challenge")
        button.btn.btn-secondary.positive-icon(v-if='!hero.auth.blocked',
          @click="adminBlockUser()", v-b-tooltip.hover.right="'Admin - Ban User'")
          .svg-icon.positive-icon(v-html="icons.lock")
        button.btn.btn-secondary.positive-icon(v-if='hero.auth.blocked',
          @click="adminUnblockUser()", v-b-tooltip.hover.right="'Admin - Unblock User'")
          .svg-icon.positive-icon(v-html="icons.member")
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
        .header.mb-3
          h1 {{user.profile.name}}
          .name(v-if='user.auth && user.auth.local && user.auth.local.username') @{{ user.auth.local.username }}
      .col-12.col-md-4
        button.btn.btn-secondary(v-if='user._id === userLoggedIn._id', @click='editing = !editing', style='float:right;') {{ $t('edit') }}
    .row(v-if='!editing')
      .col-12.col-md-8
        .about.profile-section
          h2 {{ $t('about') }}
          p(v-if='user.profile.blurb', v-markdown='user.profile.blurb')
          p(v-else) {{ $t('noDescription') }}
        .photo.profile-section
          h2 {{ $t('photo') }}
          img.img-rendering-auto(v-if='user.profile.imageUrl', :src='user.profile.imageUrl')
          p(v-else) {{ $t('noPhoto') }}

      .col-12.col-md-4
        .info.profile-section
          h2 {{ $t('info') }}
          .info-item
            .info-item-label {{ $t('joined') }}:
            .info-item-value {{userJoinedDate}}
          .info-item
            .info-item-label  {{ $t('totalLogins') }}:
            .info-item-value {{ user.loginIncentives }}
          .info-item
            .info-item-label  {{ $t('latestCheckin') }}:
            .info-item-value {{userLastLoggedIn}}
          .info-item
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
  profileStats(
    :user='user',
    v-show='selectedPage === "stats"',
    :showAllocation='showAllocation()',
    v-if='user.preferences')
</template>

<style lang="scss" >
  @import '~client/assets/scss/colors.scss';

  .profile {
    .member-details {
      .character-name, small, .small-text {
        color: #878190;
      }
    }

    .modal-content {
      background: #f9f9f9;
    }

    .gearTitle {
      color: white;
      margin-bottom: 20px;
    }

    .progress-container > .progress {
      background-color: $gray-500 !important;
      height: 16px !important;
      vertical-align: middle !important;

      .progress-bar {
        height: 16px !important;
      }
    }

    .profile-name-character {
      margin-left: 4px !important;
    }
  }

  .message-icon svg {
    height: 11px;
    margin-top: 1px;
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

  .message-icon,
  .gift-icon {
    width: 14px;
    margin: auto;
    color: $gray-100;
  }

  .gift-icon {
    width: 12px;
  }

  .remove-icon {
    width: 16px;
    color: $gray-100;
  }

  .positive-icon {
    width: 14px;
    color: $gray-100;
  }

  .photo img {
    max-width: 100%;
  }

  .header {
    h1 {
      color: $purple-200;
      margin-bottom: 0.2rem;
    }

    h4 {
      color: $gray-100;
    }
  }

  .nav {
    font-weight: bold;
    min-height: 40px;
    justify-content: center;
  }

  .nav-item {
    display: inline-block;
    margin: 0 1.2em;
    padding: 1em;
  }

  .nav-item:hover, .nav-item.active {
    color: #4f2a93;
    border-bottom: 2px solid #4f2a93;
    cursor: pointer;
  }

  .name {
    color: $gray-200;
    font-size: 16px;
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

    .member-details {
      .character-name, small, .small-text {
        color: #878190;
      }

      .progress-container > .progress {
        border-radius: 1px;
        background-color: $gray-500;
      }
    }

    .gearTitle {
      color: white;
      margin-bottom: 20px;
    }

  .profile-section {
    h2 {
      overflow: hidden;
      size: 16px;
      color: $gray-50;
    }
    h2:after {
      background-color: $gray-500;
      content: "";
      display: inline-block;
      height: 1px;
      position: relative;
      vertical-align: middle;
      width: 90%;
      left: 16px;
    }
  }

  .info {

    .info-item {
      color: $gray-200;
      size: 14px;
      margin-bottom: 8px;

      .info-item-label {
        font-weight: bold;
        display: inline-block;
      }

      .info-item-value {
        display: inline-block;
        float: right;
      }
    }

    .progress {
      height: 8px;
      border-radius: 1px;

      .progress-bar {
        border-radius: 1px;
        background-color: $green-10 !important;
      }
    }
  }
</style>

<script>
import moment from 'moment';
import axios from 'axios';
import each from 'lodash/each';
import { mapState } from 'client/libs/store';
import cloneDeep from 'lodash/cloneDeep';

import MemberDetails from '../memberDetails';
import markdown from 'client/directives/markdown';
import achievementsLib from '../../../common/script/libs/achievements';
// @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';
import Content from '../../../common/script/content';
import profileStats from './profileStats';


import message from 'assets/svg/message.svg';
import gift from 'assets/svg/gift.svg';
import remove from 'assets/svg/remove.svg';
import positive from 'assets/svg/positive.svg';
import dots from 'assets/svg/dots.svg';
import megaphone from 'assets/svg/broken-megaphone.svg';
import lock from 'assets/svg/lock.svg';
import challenge from 'assets/svg/challenge.svg';
import member from 'assets/svg/member-icon.svg';
import staff from 'assets/svg/tier-staff.svg';

export default {
  props: ['userId', 'startingPage'],
  directives: {
    markdown,
  },
  components: {
    MemberDetails,
    profileStats,
  },
  data () {
    return {
      icons: Object.freeze({
        message,
        remove,
        positive,
        gift,
        dots,
        megaphone,
        challenge,
        lock,
        member,
        staff,
      }),
      adminToolsLoaded: false,
      userIdToMessage: '',
      editing: false,
      editingProfile: {
        name: '',
        imageUrl: '',
        blurb: '',
      },
      hero: {},
      managerEmail: {
        hrefBlankCommunityManagerEmail: `<a href="mailto:${COMMUNITY_MANAGER_EMAIL}">${COMMUNITY_MANAGER_EMAIL}</a>`,
      },
      selectedPage: 'profile',
      achievements: {},
      content: Content,
      user: undefined,
    };
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
    incentivesProgress () {
      return this.getIncentivesProgress();
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
    hasClass () {
      return this.$store.getters['members:hasClass'](this.userLoggedIn);
    },
  },
  mounted () {
    this.loadUser();
  },
  watch: {
    startingPage () {
      this.selectedPage = this.startingPage;
    },
    async userId () {
      this.loadUser();
    },
    userLoggedIn () {
      this.loadUser();
    },
  },
  methods: {
    async loadUser () {
      let user = this.userLoggedIn;

      // Reset editing when user is changed. Move to watch or is this good?
      this.editing = false;
      this.hero = {};
      this.adminToolsLoaded = false;

      let profileUserId = this.userId;

      if (profileUserId && profileUserId !== this.userLoggedIn._id) {
        let response = await this.$store.dispatch('members:fetchMember', { memberId: profileUserId });
        user = response.data.data;
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

      this.user = user;
    },
    selectPage (page) {
      this.selectedPage = page;
      history.replaceState(null, null, '');
    },
    sendMessage () {
      this.$root.$emit('habitica::new-inbox-message', {
        userIdToMessage: this.user._id,
        displayName: this.user.profile.name,
        username: this.user.auth.local.username,
        backer: this.user.backer,
        contributor: this.user.contributor,
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

      let edits = cloneDeep(this.editingProfile);

      each(edits, (value, key) => {
        // Using toString because we need to compare two arrays (websites)
        let curVal = this.user.profile[key];

        if (!curVal || value.toString() !== curVal.toString()) {
          values[`profile.${key}`] = value;
          this.$set(this.user.profile, key, value);
        }
      });

      this.$store.dispatch('user:set', values);

      this.editing = false;
    },
    blockUser () {
      this.userLoggedIn.inbox.blocks.push(this.user._id);
      axios.post(`/api/v4/user/block/${this.user._id}`);
    },
    unblockUser () {
      let index = this.userLoggedIn.inbox.blocks.indexOf(this.user._id);
      this.userLoggedIn.inbox.blocks.splice(index, 1);
      axios.post(`/api/v4/user/block/${this.user._id}`);
    },
    openSendGemsModal () {
      this.$root.$emit('habitica::send-gems', this.user);
    },
    adminRevokeChat () {
      if (!this.hero.flags) {
        this.hero.flags = {};
      }
      this.hero.flags.chatRevoked = true;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },
    adminReinstateChat () {
      if (!this.hero.flags) {
        this.hero.flags = {};
      }
      this.hero.flags.chatRevoked = false;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },
    adminBlockUser () {
      this.hero.auth.blocked = true;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },
    adminUnblockUser () {
      this.hero.auth.blocked = false;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },
    async loadAdminTools () {
      this.hero = await this.$store.dispatch('hall:getHero', { uuid: this.user._id });
      this.adminToolsLoaded = true;
    },
    showAllocation () {
      return this.user._id === this.userLoggedIn._id && this.hasClass;
    },
  },
};
</script>
