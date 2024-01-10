<template>
  <div>
    <div
      v-if="!user && userLoaded"
    >
      <error404 />
    </div>
    <div
      v-else-if="userLoaded"
      class="profile mt-n3"
    >
      <!-- HEADER -->
      <div class="header">
        <div
          class="avatar mr-auto"
        >
          <member-details
            :member="user"
            :class-badge-position="'hidden'"
            class="mx-4"
          />
        </div>
      </div>
      <!-- PAGE STATE CHANGES -->
      <div class="state-pages pt-3">
        <div
          v-if="userBlocked"
          class="blocked-banned text-center mb-3 mx-4 py-2 px-3"
          v-html="$t('blockedUser')"
        >
        </div>
        <div
          v-if="hasPermission(userLoggedIn, 'moderator') && hero.auth.blocked"
          class="blocked-banned mb-3 mx-4 py-2 px-3
            d-flex align-items-middle justify-content-center"
        >
          <div
            v-once
            class="svg-icon icon-16 color my-auto ml-auto mr-2"
            v-html="icons.block"
          ></div>
          <div
            class="my-auto mr-auto"
            v-html="$t('bannedUser')"
          >
          </div>
        </div>
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
      <!-- SHOW PROFILE -->
      <div
        v-show="selectedPage === 'profile'"
        v-if="user.profile"
        id="userProfile"
        class="standard-page"
      >
        <!-- PROFILE STUFF -->
        <div
          v-if="!editing"
          class="flex-container"
        >
          <div class="flex-left">
            <div class="about mb-0">
              <h2>{{ $t('about') }}</h2>
            </div>
            <div class="flex-left">
              <div class="about profile-section">
                <p
                  v-if="user.profile.blurb"
                  v-markdown="user.profile.blurb"
                  class="markdown"
                ></p>
                <p v-else>
                  {{ $t('noDescription') }}
                </p>
              </div>
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
          <div class="ml-auto">
            <button
              v-if="user._id === userLoggedIn._id"
              class="btn btn-primary flex-right edit-profile"
              @click="editing = !editing"
            >
              {{ $t('editProfile') }}
            </button>
            <span
              v-else-if="user._id !== userLoggedIn._id"
              class="flex-right d-flex justify-content-between"
            >
              <router-link
                :to="{ path: '/private-messages', query: { uuid: user._id } }"
                replace
              >
                <button
                  class="btn btn-primary send-message"
                >
                  {{ $t('sendMessage') }}
                </button>
              </router-link>

              <!-- KEBAB MENU DROPDOWN -->
              <b-dropdown
                right="right"
                toggle-class="with-icon"
                class="mx-auto"
                :no-caret="true"
              >
                <template #button-content>
                  <span
                    v-once
                    class="svg-icon dots-icon with-icon"
                    v-html="icons.dots"
                  >
                  </span>
                </template>

                <!-- SEND GIFT -->
                <b-dropdown-item
                  class="selectListItem"
                  @click="openSendGemsModal()"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.gift"
                    ></span>
                    <span
                      v-once
                      class="send-gift"
                    >
                      {{ $t('sendGift') }}
                    </span>
                  </span>
                </b-dropdown-item>

                <!-- REPORT PLAYER -->
                <b-dropdown-item
                  class="selectListItem"
                  :class="{ disabled: !canReport }"
                  :disabled="!canReport"
                  @click="reportPlayer()"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.report"
                    ></span>
                    <span v-once>
                      {{ $t('reportPlayer') }}
                    </span>
                  </span>
                </b-dropdown-item>

                <!-- BLOCK PLAYER -->
                <b-dropdown-item
                  v-if="!userBlocked"
                  class="selectListItem block-ban"
                  @click.native.capture.stop="blockUser()"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.block"
                    ></span>
                    <span v-once>
                      {{ $t('blockPlayer') }}
                    </span>
                  </span>
                </b-dropdown-item>
                <b-dropdown-item
                  v-else
                  class="selectListItem block-ban"
                  @click.native.capture.stop="unblockUser()"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.block"
                    ></span>
                    <span v-once>
                      {{ $t('unblock') }}
                    </span>
                  </span>
                </b-dropdown-item>

                <!-- REST OF DROPDOWN ONLY VISIBLE IF ADMIN -->
                <div
                  v-if="hasPermission(userLoggedIn, 'moderator')"
                >
                  <!-- ADMIN TOOLS HEADER -->
                  <div
                    class="admin-tools-divider"
                  >
                    <span v-once>
                      <strong>{{ $t('adminTools') }}</strong>
                    </span>
                  </div>

                  <!-- ADMIN PANEL -->
                  <b-dropdown-item
                    v-if="hasPermission(userLoggedIn, 'userSupport')"
                    class="selectListItem"
                    @click="openAdminPanel()"
                  >
                    <span class="with-icon">
                      <span
                        v-once
                        class="svg-icon icon-16 color"
                        v-html="icons.crown"
                      ></span>
                      <span v-once>
                        {{ $t('viewAdminPanel') }}
                      </span>
                    </span>
                  </b-dropdown-item>

                  <!-- BAN USER -->
                  <b-dropdown-item
                    v-if="!hero.auth.blocked"
                    class="selectListItem block-ban"
                    @click.native.capture.stop="adminToggleBan()"
                  >
                    <span class="with-icon">
                      <span
                        v-once
                        class="svg-icon icon-16 color"
                        v-html="icons.block"
                      ></span>
                      <span v-once>
                        {{ $t('banPlayer') }}
                      </span>
                    </span>
                  </b-dropdown-item>
                  <b-dropdown-item
                    v-else
                    class="selectListItem block-ban"
                    @click.native.capture.stop="adminToggleBan()"
                  >
                    <span class="with-icon">
                      <span
                        v-once
                        class="svg-icon icon-16 color"
                        v-html="icons.block"
                      ></span>
                      <span v-once>
                        {{ $t('unbanPlayer') }}
                      </span>
                    </span>
                  </b-dropdown-item>

                  <!-- SHADOW MUTE PLAYER WITH TOGGLE -->
                  <b-dropdown-item
                    class="selectListItem"
                    @click.native.capture.stop="adminToggleShadowMute()"
                  >
                    <span class="with-icon">
                      <span
                        v-once
                        class="svg-icon icon-16 color"
                        v-html="icons.shadowMute"
                      ></span>
                      <span
                        v-once
                        class="admin-action"
                      >
                        {{ $t('shadowMute') }}
                      </span>
                      <toggle-switch
                        v-model="hero.flags.chatShadowMuted"
                        class="toggle-switch-outer ml-auto"
                        @change.native.capture.stop="adminToggleShadowMute()"
                      />
                    </span>
                  </b-dropdown-item>

                  <!-- MUTE PLAYER WITH TOGGLE -->
                  <b-dropdown-item
                    class="selectListItem"
                    @click.native.capture.stop="adminToggleChatRevoke()"
                  >
                    <span class="with-icon">
                      <span
                        v-once
                        class="svg-icon icon-16 color"
                        v-html="icons.mute"
                      ></span>
                      <span v-once>
                        {{ $t('mutePlayer') }}
                      </span>
                      <toggle-switch
                        v-model="hero.flags.chatRevoked"
                        class="toggle-switch-outer ml-auto"
                        @change.native.capture.stop="adminToggleChatRevoke()"
                      />
                    </span>
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </span>

            <!-- ACCOUNT DATES, LOG IN COUNTER -->
            <div class="info profile-section">
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
                <div class="info-item-label">
                  {{ $t('nextReward') }}:
                </div>
                <div class="info-item-value">
                  {{ getNextIncentive() }} {{ getNextIncentive() === 1 ? $t('day') : $t('days') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- EDITING PROFILE -->
        <div
          v-if="editing"
          class="row"
        >
          <h1>{{ $t('editProfile') }}</h1>
          <div class="">
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
          <div class=" text-center">
            <button
              class="btn btn-primary"
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
      <!-- ACHIEVEMENTS -->
      <div
        v-show="selectedPage === 'achievements'"
        v-if="user.achievements"
        id="achievements"
        class="standard-page container "
      >
        <div
          v-for="(category, key) in achievements"
          :key="key"
          class="row category-row d-flex flex-column"
        >
          <h3 class="text-center">
            {{ $t(`${key}Achievs`) }}
          </h3>
          <div class="">
            <div class="row achievements-row justify-content-center">
              <div
                v-for="(achievement, achievKey) in achievementsCategory(key, category)"
                :key="achievKey"
                class="achievement-wrapper col text-center"
              >
                <div
                  :id="achievKey + '-achievement'"
                  class="box achievement-container d-flex justify-content-center align-items-middle"
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
                    class="achievement m-auto"
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
                    class="achievement achievement-unearned achievement-unearned2x m-auto"
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
        <hr class="">
        <div class="row">
          <div
            v-if="user.achievements.challenges"
            class="col-12 col-md-6"
          >
            <div class="achievement-icon achievement-karaoke-2x"></div>
            <h3 class="text-center">
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
            <h3 class="text-center">
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
      <!-- STATS -->
      <div>
        <profileStats
          v-show="selectedPage === 'stats'"
          v-if="user.preferences"
          :user="user"
          :show-allocation="showAllocation()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" >
  @import '~@/assets/scss/colors.scss';

  #userProfile {

    .dropdown-menu {
      margin-left: -48px;
      width: 210px;
    }

    .dropdown-item {
      svg {
        color: $gray-50;
      }
      &.disabled {
        color: $gray-50 !important;
        opacity: 0.75;
        svg {
          color: $gray-50;
          opacity: 0.75;
        }
      }
      &:not(.disabled):hover, &:not(.disabled):focus {
        a, svg {
          color: $purple-300;
        }
      }
    }

    .drawer-toggle-icon {
      position: absolute;
      right: 16px;
      bottom: 0;

      &.closed {
        top: 10px;
      }
    }

    .toggle-switch-outer {
      margin-bottom: 2px;
    }

    .selectListItem {
      &:not(.disabled):hover svg {
        color: $purple-300;
      }
      &.block-ban {
        &:hover, .dropdown-item:hover {
          color: $maroon-50 !important;
          background-color: rgba($red-500, 0.25) !important;
          svg {
            color: $maroon-50;
          }
        }
        &:focus, .dropdown-item:focus {
          color: $maroon-50 !important;
          svg {
            color: $maroon-50;
          }
        &:active, .dropdown-item:active {
          color: $gray-50 !important;
        }
        }
      }
    }
  }

  .profile {
    .member-details {
      background-color: $white;
    }

    .avatar-container {
      padding-top: 16px;
    }

    .progress-container > .progress {
      background-color: $gray-500 !important;
      border-radius: 2px;
      height: 16px !important;
      min-width: 375px !important;
      vertical-align: middle !important;

      .progress-bar {
        height: 16px !important;
      }
    }

    .progress-container > .svg-icon {
      width: 28px;
      margin-top: -2px !important;
      height: 28px;
      margin-right: 8px;
    }

    .profile-first-row,
    .progress-container {
      margin-left: 4px;
      margin-top: 4px;

      .small-text {
        color: $gray-50;
      }
    }

    .character-name {
      color: $gray-50;
      font-weight: bold;
      height: 24px;
      line-height: 1.71;
      margin-bottom: 0px;
    }

    small {
      color: $gray-50;
      font-size: 0.75em;
      line-height: 1.33;
    }
  }

</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .avatar {
    width: fit-content;
  }

  .header {
    width: 100%;
  }

  .markdown p {
    padding-bottom: 24px;
  }

  .standard-page {
    background-color: $gray-700;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding-top: 0px;
  }

  .flex-container {
    display: flex;
    flex-direction: row;
    padding-top: 18px;
  }

  .flex-left {
    width: 424px;
  }

  .flex-right {
    width: 188px;
  }

  .admin-profile-actions {
    margin-bottom: 48px;

    .admin-action {
      color: $red-500;
      cursor: pointer;
    }
  }

  .message-icon svg {
    height: 11px;
    margin-top: 1px;
  }

  .dots-icon {
    height: 16px;
    width: 4px;
  }

  .toggle-switch-outer {
    margin-bottom: 2px;
  }

  .photo {
    img {
      max-width: 100%;
    }
  }

  .header {
    h1 {
      color: $gray-50;
      margin-bottom: 0.2rem;
    }

    h4 {
      color: $gray-100;
    }
  }

  .blocked-banned {
    background-color: $maroon-100;
    border-radius: 4px;
    color: $white;
    line-height: 1.71;

    svg {
      color: $white;
    }
  }

  .state-pages {
    background-color: $gray-700;
    margin-left: 0px;
    margin-right: 0px;
    width: 100%;
  }

  .nav {
    font-size: 0.75rem;
    font-weight: bold;
    justify-content: center;
    min-height: 40px;
    padding-top: 16px;
    width: 100%;
  }

  .nav-item {
    color: $gray-50;
    display: inline-block;
    margin: 0 8px 8px 6px;
  }

  .nav-item:hover, .nav-item.active {
    border-bottom: 2px solid $purple-300;
    color: $purple-300;
    cursor: pointer;
  }

  .name {
    color: $gray-200;
    font-size: 16px;
  }

  .white {
    background: $white;
    border: 1px solid transparent;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  }

  .item-wrapper {
    h3 {
      text-align: center;
    }
  }

  .profile-section {
    h2 {
      color: $gray-50;
      margin-bottom: 20px !important;
      overflow: hidden;
      size: 1.125em;
    }
  }

  .about {
    line-height: 1.71;
  }

 .edit-profile {
    font-size: 1em;
    margin-left: 24px;
    padding: 4px 16px;
    width: 188px;
  }

  .send-message {
    font-size: 1em;
    line-height: 1.71;
    margin-left: 24px;
    margin-right: 8px;
    margin-top: 0px;
    width: 148px;
  }

  .dot-menu {
    height: 32px;
    margin-right: -24px;
    width: 32px;
  }

  .send-gift {
    margin-top: 3px;
  }

  .admin-tools-divider {
    color: $gray-50;
    cursor: default;
    background-color: $gray-700;
    font-size: 0.875em;
    line-height: 1.71;
    padding: 4px 12px;
    height: 32px;
  }

  .info {
    margin-top: 16px;
    line-height: 1.71;
    size: 0.875em;
    width: 212px;

    .info-item {
      color: $gray-50;
      margin-bottom: 4px;
      margin-left: 24px;

      .info-item-label {
        display: inline-block;
        font-weight: bold;
      }

      .info-item-value {
        float: right;
      }
    }
  }

  .achievement {
    margin: 0 auto;
  }

  .box {
    border: dotted 1px #c3c0c7;
    border-radius: 2px;
    height: 92px;
    width: 94px;
  }

  #achievements {
    .category-row {
      margin-bottom: 34px;
      justify-content: center;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    .achievements-row {
      margin: 0 auto;
      max-width: 590px;
    }

    .achievement-wrapper {
      margin-left: 12px;
      margin-right: 12px;
      max-width: 94px;
      min-width: 94px;
      padding: 0px;
      width: 94px;
    }

    .box {
      background: $white;
      margin: 0 auto;
      margin-bottom: 16px;
    }

    hr {
      margin-bottom: 48px;
      margin-top: 48px;
    }

    .box.achievement-unearned {
      background-color: $gray-600;
    }

    .counter.badge {
      background-color: $orange-100;
      color: $white;
      max-height: 24px;
      position: absolute;
      right: -8px;
      top: -12.8px;
    }

    .achievement-icon {
      margin: 0 auto;
    }

    .achievement-list-item {
      border-top: 1px solid $gray-500;
      padding-bottom: 12px;
      padding-top: 11px;

      &:last-child {
        border-bottom: 1px solid $gray-500;
      }

      .badge {
        background: $gray-600;
        color: $gray-300;
        height: fit-content;
        margin-right: 8px;
      }
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

// eslint-disable-next-line vue/component-tags-order
<script>
import moment from 'moment';
import axios from 'axios';
import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import achievementsLib from '@/../../common/script/libs/achievements';
import Content from '@/../../common/script/content';
import toggleSwitch from '../ui/toggleSwitch';
import { mapState } from '@/libs/store';

import MemberDetails from '../memberDetails';
import markdown from '@/directives/markdown';
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
import report from '@/assets/svg/report.svg';
import crown from '@/assets/svg/crown.svg';
import mute from '@/assets/svg/mute.svg';
import shadowMute from '@/assets/svg/shadow-mute.svg';
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
    toggleSwitch,
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
        report,
        crown,
        mute,
        shadowMute,
      }),
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
      isOpened: true,
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
    isOpen () {
      // Open status is a number so we can tell if the value was passed
      if (this.openStatus !== undefined) return this.openStatus === 1;
      return this.isOpened;
    },
    userBlocked () {
      return this.userLoggedIn.inbox.blocks.indexOf(this.user._id) !== -1;
    },
    // userBanned () {
    //   return this.userLoggedIn.auth.blocked.valueOf(this.user._id.auth.blocked);
    // },
    canReport () {
      if (!this.user || !this.user.profile || !this.user.profile.flags) {
        return true;
      }
      return Boolean(this.hasPermission(this.userLoggedIn, 'moderator')
        || !this.user.profile.flags[this.userLoggedIn._id]);
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
    this.$root.$on('habitica:report-profile-result', () => {
      this.loadUser();
    });
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
    this.$root.$off('habitica:report-profile-result');
  },
  methods: {
    async loadUser () {
      let user = null;

      // Reset editing when user is changed. Move to watch or is this good?
      this.editing = false;
      this.hero = {};
      this.userLoaded = false;

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

      if (this.hasPermission(this.userLoggedIn, 'moderator')) {
        this.hero = await this.$store.dispatch('hall:getHero', { uuid: this.user._id });
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
    getNextIncentive () {
      const currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      if (!currentLoginDay) return 0;
      const previousRewardDay = currentLoginDay.prevRewardKey || 0;
      const { nextRewardAt } = currentLoginDay;
      return ((nextRewardAt - previousRewardDay));
    },
    async save () {
      const values = {};
      const edits = cloneDeep(this.editingProfile);
      const oldProfile = cloneDeep(this.user.profile);

      each(edits, (value, key) => {
        // Using toString because we need to compare two arrays (websites)
        const curVal = this.user.profile[key];
        if (!curVal || value.toString() !== curVal.toString()) {
          values[`profile.${key}`] = value;
          this.$set(this.user.profile, key, value);
        }
      });

      await this.$store.dispatch('user:set', values).catch(() => {
        this.user.profile = oldProfile;
        this.editingProfile.name = this.user.profile.name;
        this.editingProfile.imageUrl = this.user.profile.imageUrl;
        this.editingProfile.blurb = this.user.profile.blurb;
      });
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

    adminToggleShadowMute () {
      if (!this.hero.flags) {
        this.hero.flags = {};
        this.hero.flags.chatShadowMuted = true;
      } else {
        this.hero.flags.chatShadowMuted = !this.hero.flags.chatShadowMuted;
      }
      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },

    adminToggleChatRevoke () {
      if (!this.hero.flags) {
        this.hero.flags = {};
        this.hero.flags.chatRevoked = true;
      } else {
        this.hero.flags.chatRevoked = !this.hero.flags.chatRevoked;
      }
      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
    },

    adminToggleBan () {
      this.hero.auth.blocked = !this.hero.auth.blocked;
      this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
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

    toggle () {
      this.isOpened = !this.isOpen;
      this.$emit('toggled', this.isOpened);
    },

    open () {
      this.isOpened = true;
      this.$emit('toggled', this.isOpened);
    },

    reportPlayer () {
      this.$root.$emit('habitica::report-profile', {
        memberId: this.user._id,
        displayName: this.user.profile.name,
        username: this.user.auth.local.username,
      });
    },

    openAdminPanel () {
      this.$router.push(`/admin-panel/${this.hero._id}`);
    },
  },
};
</script>
