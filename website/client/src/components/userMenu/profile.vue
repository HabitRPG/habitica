<template>
  <div
    v-if="!user && userLoaded"
  >
    <error404 />
  </div>
  <div
    v-else-if="userLoaded"
    class="profile"
  >
    <div class="header">
      <div class="profile-actions d-flex">
        <router-link
          :to="{ path: '/private-messages', query: { uuid: user._id } }"
          replace
        >
          <button
            v-b-tooltip.hover.left="$t('sendMessage')"
            class="btn btn-secondary message-icon"
          >
            <div
              v-once
              class="svg-icon message-icon"
              v-html="icons.message"
            ></div>
          </button>
        </router-link>
        <button
          v-b-tooltip.hover.bottom="$t('sendGems')"
          class="btn btn-secondary gift-icon"
          @click="openSendGemsModal()"
        >
          <div
            class="svg-icon gift-icon"
            v-html="icons.gift"
          ></div>
        </button>
        <button
          v-if="user._id !== userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) === -1"
          v-b-tooltip.hover.right="$t('blockWarning')"
          class="btn btn-secondary block-icon d-flex justify-content-center align-items-center"
          @click="blockUser()"
        >
          <div
            v-once
            class="svg-icon block-icon"
            v-html="icons.block"
          ></div>
        </button>
        <button
          v-if="user._id !== userLoggedIn._id && userLoggedIn.inbox.blocks.indexOf(user._id) !== -1"
          v-b-tooltip.hover.right="$t('unblock')"
          class="btn btn-secondary positive-icon"
          @click="unblockUser()"
        >
          <div
            class="svg-icon positive-icon"
            v-html="icons.positive"
          ></div>
        </button>
        <button
          v-if="hasPermission(userLoggedIn, 'moderator')"
          v-b-tooltip.hover.right="'Admin - Toggle Tools'"
          class="btn btn-secondary positive-icon d-flex justify-content-center align-items-center"
          @click="toggleAdminTools()"
        >
          <div
            class="svg-icon positive-icon"
            v-html="icons.staff"
          ></div>
        </button>
      </div>
      <div
        v-if="hasPermission(userLoggedIn, 'moderator') && adminToolsLoaded"
        class="row admin-profile-actions"
      >
        <div class="col-12 text-right">
          <span
            v-if="!hero.flags || (hero.flags && !hero.flags.chatShadowMuted)"
            v-b-tooltip.hover.bottom="'Turn on Shadow Muting'"
            class="admin-action"
            @click="adminTurnOnShadowMuting()"
          >shadow-mute</span>
          <span
            v-if="hero.flags && hero.flags.chatShadowMuted"
            v-b-tooltip.hover.bottom="'Turn off Shadow Muting'"
            class="admin-action"
            @click="adminTurnOffShadowMuting()"
          >un-shadow-mute</span>
          <span
            v-if="!hero.flags || (hero.flags && !hero.flags.chatRevoked)"
            v-b-tooltip.hover.bottom="'Revoke Chat Privileges'"
            class="admin-action"
            @click="adminRevokeChat()"
          >mute</span>
          <span
            v-if="hero.flags && hero.flags.chatRevoked"
            v-b-tooltip.hover.bottom="'Reinstate Chat Privileges'"
            class="admin-action"
            @click="adminReinstateChat()"
          >un-mute</span>
          <span
            v-if="!hero.auth.blocked"
            v-b-tooltip.hover.bottom="'Ban User'"
            class="admin-action"
            @click="adminBlockUser()"
          >ban</span>
          <span
            v-if="hero.auth.blocked"
            v-b-tooltip.hover.bottom="'Un-Ban User'"
            class="admin-action"
            @click="adminUnblockUser()"
          >un-ban</span>
          <router-link
            :to="{ name: 'adminPanelUser', params: { userIdentifier: userId } }"
            replace
          >
            Admin Panel
          </router-link>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <member-details :member="user" />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="text-center nav">
        <div
          class="nav-item"
          :class="{active: selectedPage === 'profile'}"
          @click="selectPage('profile')"
        >
          {{ $t('profile') }}
        </div>
        <div
          class="nav-item"
          :class="{active: selectedPage === 'stats'}"
          @click="selectPage('stats')"
        >
          {{ $t('stats') }}
        </div>
        <div
          class="nav-item"
          :class="{active: selectedPage === 'achievements'}"
          @click="selectPage('achievements')"
        >
          {{ $t('achievements') }}
        </div>
      </div>
    </div>
    <div
      v-show="selectedPage === 'profile'"
      v-if="user.profile"
      id="userProfile"
      class="standard-page"
    >
      <div class="row">
        <div class="col-12 col-md-8">
          <div class="header mb-3">
            <h1>{{ user.profile.name }}</h1>
            <div
              v-if="user.auth && user.auth.local && user.auth.local.username"
              class="name"
            >
              @{{ user.auth.local.username }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <button
            v-if="user._id === userLoggedIn._id"
            class="btn btn-secondary"
            style="float:right;"
            @click="editing = !editing"
          >
            {{ $t('edit') }}
          </button>
        </div>
      </div>
      <div
        v-if="!editing"
        class="row"
      >
        <div class="col-12 col-md-8">
          <div class="about profile-section">
            <h2>{{ $t('about') }}</h2>
            <p
              v-if="user.profile.blurb"
              v-markdown="user.profile.blurb"
            ></p>
            <p v-else>
              {{ $t('noDescription') }}
            </p>
          </div>
          <div class="photo profile-section">
            <h2>{{ $t('photo') }}</h2>
            <img
              v-if="user.profile.imageUrl"
              class="img-rendering-auto"
              :src="user.profile.imageUrl"
            >
            <p v-else>
              {{ $t('noPhoto') }}
            </p>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="info profile-section">
            <h2>{{ $t('info') }}</h2>
            <div class="info-item">
              <div class="info-item-label">
                {{ $t('joined') }}:
              </div>
              <div class="info-item-value">
                {{ userJoinedDate }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-label">
                {{ $t('totalLogins') }}:
              </div>
              <div class="info-item-value">
                {{ user.loginIncentives }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-item-label">
                {{ $t('latestCheckin') }}:
              </div>
              <div class="info-item-value">
                {{ userLastLoggedIn }}
              </div>
            </div>
            <div class="info-item">
              {{ getProgressDisplay() }}
              <div class="progress">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :aria-valuenow="incentivesProgress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :style="{width: incentivesProgress + '%'}"
                >
                  <span class="sr-only">{{ incentivesProgress }}% {{ $t('complete') }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- @TODO: Implement in V2 .social-->
        </div>
      </div>
      <div
        v-if="editing"
        class="row"
      >
        <h1>{{ $t('editProfile') }}</h1>
        <div class="col-12">
          <div
            class="alert alert-info alert-sm"
            v-html="$t('communityGuidelinesWarning', managerEmail)"
          ></div>
          <!-- TODO use photo-upload instead: https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/xMmADvxBOak-->
          <div class="form-group">
            <label>{{ $t('displayName') }}</label>
            <input
              v-model="editingProfile.name"
              class="form-control"
              type="text"
              :placeholder="$t('fullName')"
            >
          </div>
          <div class="form-group">
            <label>{{ $t('photoUrl') }}</label>
            <input
              v-model="editingProfile.imageUrl"
              class="form-control"
              type="url"
              :placeholder="$t('imageUrl')"
            >
          </div>
          <div class="form-group">
            <label>{{ $t('about') }}</label>
            <textarea
              v-model="editingProfile.blurb"
              class="form-control"
              rows="5"
              :placeholder="$t('displayBlurbPlaceholder')"
            ></textarea>
            <!-- include ../../shared/formatting-help-->
          </div>
        </div>
        <div class="col-12 text-center">
          <button
            class="btn btn-primary mr-2"
            @click="save()"
          >
            {{ $t("save") }}
          </button>
          <button
            class="btn btn-secondary"
            @click="editing = false"
          >
            {{ $t("cancel") }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-show="selectedPage === 'achievements'"
      v-if="user.achievements"
      id="achievements"
      class="standard-page container"
    >
      <div
        v-for="(category, key) in achievements"
        :key="key"
        class="row category-row"
      >
        <h3 class="col-12 text-center mb-3">
          {{ $t(`${key}Achievs`) }}
        </h3>
        <div class="col-12">
          <div class="row achievements-row justify-content-center">
            <div
              v-for="(achievement, achievKey) in achievementsCategory(key, category)"
              :key="achievKey"
              class="achievement-wrapper col text-center"
            >
              <div
                :id="achievKey + '-achievement'"
                class="box achievement-container"
                :class="{'achievement-unearned': !achievement.earned}"
              >
                <b-popover
                  :target="'#' + achievKey + '-achievement'"
                  triggers="hover"
                  placement="top"
                >
                  <h4 class="popover-content-title">
                    {{ achievement.title }}
                  </h4>
                  <div
                    class="popover-content-text"
                    v-html="achievement.text"
                  ></div>
                </b-popover>
                <div
                  v-if="achievement.earned"
                  class="achievement"
                  :class="achievement.icon + '2x'"
                >
                  <div
                    v-if="achievement.optionalCount"
                    class="counter badge badge-pill stack-count"
                  >
                    {{ achievement.optionalCount }}
                  </div>
                </div>
                <div
                  v-if="!achievement.earned"
                  class="achievement achievement-unearned achievement-unearned2x"
                ></div>
              </div>
            </div>
          </div>
          <div
            v-if="achievementsCategories[key].number > 5"
            class="btn btn-flat btn-show-more"
            @click="toggleAchievementsCategory(key)"
          >
            {{ achievementsCategories[key].open ?
              $t('hideAchievements', {category: $t(`${key}Achievs`)}) :
              $t('showAllAchievements', {category: $t(`${key}Achievs`)})
            }}
          </div>
        </div>
      </div>
      <hr class="col-12">
      <div class="row">
        <div
          v-if="user.achievements.challenges"
          class="col-12 col-md-6"
        >
          <div class="achievement-icon achievement-karaoke-2x"></div>
          <h3 class="text-center mt-2 mb-4">
            {{ $t('challengesWon') }}
          </h3>
          <div
            v-for="chal in user.achievements.challenges"
            :key="chal"
            class="achievement-list-item"
          >
            <span v-markdown="chal"></span>
          </div>
        </div>
        <div
          v-if="user.achievements.quests"
          class="col-12 col-md-6"
        >
          <div class="achievement-icon achievement-alien2x"></div>
          <h3 class="text-center mt-2 mb-4">
            {{ $t('questsCompleted') }}
          </h3>
          <div
            v-for="(value, key) in user.achievements.quests"
            :key="key"
            class="achievement-list-item d-flex justify-content-between"
          >
            <span>{{ content.quests[key].text() }}</span>
            <span
              v-if="value > 1"
              class="badge badge-pill stack-count"
            >
              {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <profileStats
      v-show="selectedPage === 'stats'"
      v-if="user.preferences"
      :user="user"
      :show-allocation="showAllocation()"
    />
  </div>
</template>

<style lang="scss" >
  @import '~@/assets/scss/colors.scss';

  .profile {
    .member-details {
      .character-name, small, .small-text {
        color: #878190;
      }
    }

    .standard-page {
      padding-bottom: 0rem;
    }

    .modal-content {
      background: #f9f9f9;
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
  @import '~@/assets/scss/colors.scss';

  .header {
    width: 100%;
  }

  .admin-profile-actions {
    margin-bottom: 3em;

    .admin-action {
      color: blue;
      cursor: pointer;
      padding: 0 1em;
    }
  }

  .profile-actions {
    float: right;
    margin-right: 1em;

    button {
      width: 32px;
      height: 32px;
      padding: 0.5em;
      margin-right: 0.5em;
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

  .block-icon {
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
    width: 100%;
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
    .category-row {
      margin-bottom: 34px;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    .achievements-row {
      max-width: 590px;
      margin: 0 auto;
    }

    .achievement-wrapper {
      width: 94px;
      max-width: 94px;
      min-width: 94px;
      margin-right: 12px;
      margin-left: 12px;
      padding: 0px;
    }

    .box {
      margin: 0 auto;
      margin-bottom: 1em;
      padding-top: 1.2em;
      background: $white;
    }

    hr {
      margin-bottom: 48px;
      margin-top: 48px;
    }

    .box.achievement-unearned {
      background-color: $gray-600;
    }

    .counter.badge {
      position: absolute;
      top: -0.8em;
      right: -0.5em;
      color: $white;
      background-color: $orange-100;
      max-height: 24px;
    }

    .achievement-icon {
      margin: 0 auto;
    }

    .achievement-list-item {
      padding-top: 11px;
      padding-bottom: 12px;
      border-top: 1px solid $gray-500;

      &:last-child {
        border-bottom: 1px solid $gray-500;
      }

      .badge {
        margin-right: 8px;
        background: $gray-600;
        color: $gray-300;
        height: fit-content;
      }
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
      width: 100%;
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

  @media (max-width: 990px) {
    .profile-actions {
      flex-direction: column;
    }
    .profile-actions :not(:last-child) {
      margin-bottom: 15px;
    }
    .profile-actions {
      margin-right: 0;
    }
  }

  @media (max-width: 550px) {
    .member-details {
      flex-direction: column;
    }
    .member-details .avatar {
      margin-bottom: 15px;
    }
  }
</style>

<script>
import moment from 'moment';
import axios from 'axios';
import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import { mapState } from '@/libs/store';

import MemberDetails from '../memberDetails';
import markdown from '@/directives/markdown';
import achievementsLib from '@/../../common/script/libs/achievements';
import Content from '@/../../common/script/content';
import profileStats from './profileStats';

import message from '@/assets/svg/message.svg';
import gift from '@/assets/svg/gift.svg';
import block from '@/assets/svg/block.svg';
import positive from '@/assets/svg/positive.svg';
import dots from '@/assets/svg/dots.svg';
import megaphone from '@/assets/svg/broken-megaphone.svg';
import lock from '@/assets/svg/lock.svg';
import challenge from '@/assets/svg/challenge.svg';
import member from '@/assets/svg/member-icon.svg';
import staff from '@/assets/svg/tier-staff.svg';
import error404 from '../404';
import externalLinks from '../../mixins/externalLinks';
import { userCustomStateMixin } from '../../mixins/userState';
// @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';

export default {
  directives: {
    markdown,
  },
  components: {
    MemberDetails,
    profileStats,
    error404,
  },
  mixins: [externalLinks, userCustomStateMixin('userLoggedIn')],
  props: ['userId', 'startingPage'],
  data () {
    return {
      icons: Object.freeze({
        message,
        block,
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
      achievementsCategories: {}, // number, open
      content: Content,
      user: null,
      userLoaded: false,
      oldTitle: null,
    };
  },
  computed: {
    ...mapState({
      flatGear: 'content.gear.flat',
    }),
    userJoinedDate () {
      return moment(this.user.auth.timestamps.created)
        .format(this.userLoggedIn.preferences.dateFormat.toUpperCase());
    },
    userLastLoggedIn () {
      return moment(this.user.auth.timestamps.loggedin)
        .format(this.userLoggedIn.preferences.dateFormat.toUpperCase());
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
      const classTexts = {
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
  mounted () {
    this.loadUser();
    this.oldTitle = this.$store.state.title;
    this.handleExternalLinks();
    this.selectPage(this.startingPage);
  },
  updated () {
    this.handleExternalLinks();
  },
  beforeDestroy () {
    if (this.oldTitle) {
      this.$store.dispatch('common:setTitle', {
        fullTitle: this.oldTitle,
      });
    }
  },
  methods: {
    async loadUser () {
      let user = null;

      // Reset editing when user is changed. Move to watch or is this good?
      this.editing = false;
      this.hero = {};
      this.userLoaded = false;
      this.adminToolsLoaded = false;

      const profileUserId = this.userId;

      if (profileUserId && profileUserId !== this.userLoggedIn._id) {
        const response = await this.$store.dispatch('members:fetchMember', {
          memberId: profileUserId,
          unpack: false,
        });
        if (response.response && response.response.status === 404) {
          user = null;
          this.$store.dispatch('snackbars:add', {
            title: 'Habitica',
            text: this.$t('messageDeletedUser'),
            type: 'error',
            timeout: false,
          });
        } else if (response.status && response.status === 200) {
          user = response.data.data;
        }
      } else {
        user = this.userLoggedIn;
      }

      if (user) {
        this.editingProfile.name = user.profile.name;
        this.editingProfile.imageUrl = user.profile.imageUrl;
        this.editingProfile.blurb = user.profile.blurb;

        if (!user.achievements.quests) user.achievements.quests = {};
        if (!user.achievements.challenges) user.achievements.challenges = {};
        // @TODO: this common code should handle the above
        this.achievements = achievementsLib.getAchievementsForProfile(user);

        const achievementsCategories = {};
        Object.keys(this.achievements).forEach(category => {
          achievementsCategories[category] = {
            open: false,
            number: Object.keys(this.achievements[category].achievements).length,
          };
        });

        this.achievementsCategories = achievementsCategories;

        // @TODO For some reason markdown doesn't seem to be handling numbers or maybe undefined?
        user.profile.blurb = user.profile.blurb ? `${user.profile.blurb}` : '';

        this.user = user;
      }

      this.userLoaded = true;
    },
    selectPage (page) {
      this.selectedPage = page || 'profile';
      window.history.replaceState(null, null, '');
      this.$store.dispatch('common:setTitle', {
        section: this.$t('user'),
        subSection: this.$t(this.startingPage),
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
      const currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      if (!currentLoginDay) return 0;
      const previousRewardDay = currentLoginDay.prevRewardKey;
      const { nextRewardAt } = currentLoginDay;
      return ((this.user.loginIncentives - previousRewardDay)
        / (nextRewardAt - previousRewardDay)) * 100;
    },
    save () {
      const values = {};

      const edits = cloneDeep(this.editingProfile);

      each(edits, (value, key) => {
        // Using toString because we need to compare two arrays (websites)
        const curVal = this.user.profile[key];

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
      const index = this.userLoggedIn.inbox.blocks.indexOf(this.user._id);
      this.userLoggedIn.inbox.blocks.splice(index, 1);
      axios.post(`/api/v4/user/block/${this.user._id}`);
    },
    openSendGemsModal () {
      this.$store.state.giftModalOptions.startingPage = 'buyGems';
      this.$root.$emit('habitica::send-gift', this.user);
    },
    adminTurnOnShadowMuting () {
      if (!this.hero.flags) {
        this.hero.flags = {};
      }
      this.hero.flags.chatShadowMuted = true;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },
    adminTurnOffShadowMuting () {
      if (!this.hero.flags) {
        this.hero.flags = {};
      }
      this.hero.flags.chatShadowMuted = false;

      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
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
    async toggleAdminTools () {
      if (this.adminToolsLoaded) {
        this.adminToolsLoaded = false;
      } else {
        this.hero = await this.$store.dispatch('hall:getHero', { uuid: this.user._id });
        this.adminToolsLoaded = true;
      }
    },
    showAllocation () {
      return this.user._id === this.userLoggedIn._id && this.hasClass;
    },
    achievementsCategory (categoryKey, category) {
      const achievementsKeys = Object.keys(category.achievements);

      if (this.achievementsCategories[categoryKey].open === true) {
        return category.achievements;
      }

      const fiveAchievements = achievementsKeys.slice(0, 5);

      const categoryAchievements = {};

      fiveAchievements.forEach(key => {
        categoryAchievements[key] = category.achievements[key];
      });

      return categoryAchievements;
    },
    toggleAchievementsCategory (categoryKey) {
      const status = this.achievementsCategories[categoryKey].open;
      this.achievementsCategories[categoryKey].open = !status;
    },
  },
};
</script>
