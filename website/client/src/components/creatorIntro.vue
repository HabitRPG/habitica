<template>
  <b-modal
    id="avatar-modal"
    title
    :size="editing ? 'lg' : 'md'"
    :hide-header="true"
    :hide-footer="true"
    :modal-class="{'page-2':modalPage > 1 && !editing}"
    :no-close-on-esc="!editing"
    :no-close-on-backdrop="!editing"
  >
    <close-x
      v-if="editing"
      @close="close()"
    />
    <div
      v-if="modalPage === 1 && !editing"
      class="section row welcome-section"
    >
      <div class="col-6 offset-3 text-center">
        <h3 v-once>
          {{ $t('welcomeTo') }}
        </h3>
        <div
          class="svg-icon logo"
          v-html="icons.logoPurple"
        ></div>
      </div>
    </div>
    <h2
      v-if="editing"
      class="text-center pt-2 mt-4 mb-4"
    >
      {{ $t('editAvatar') }}
    </h2>
    <div
      v-if="modalPage > 1"
      class="avatar-section d-flex justify-content-center"
      :class="{'page-2': modalPage === 2}"
    >
      <div>
        <div
          v-if="!editing"
          class="user-creation-bg mt-5"
        >
          <avatar
            class="new-user"
            :member="user"
            :avatar-only="true"
            :override-top-padding="'0px'"
          />
        </div>
        <avatar
          v-else
          :member="user"
          :avatar-only="false"
        />
      </div>
    </div>
    <div
      v-if="modalPage === 2"
      class="section"
    >
      <div
        id="options-nav"
        class="container section text-center customize-menu px-5"
      >
        <div class="row justify-content-around">
          <div
            class="menu-container"
            :class="{active: activeTopPage === 'body'}"
            @click="changeTopPage('body', 'size')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.bodyIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('bodyBody') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{active: activeTopPage === 'skin'}"
            @click="changeTopPage('skin', 'color')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.skinIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('skin') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{active: activeTopPage === 'hair'}"
            @click="changeTopPage('hair', 'color')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.hairIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('hair') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            class="menu-container"
            :class="{active: activeTopPage === 'extra'}"
            @click="changeTopPage('extra', 'glasses')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.accessoriesIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('extra') }}</strong>
            <div class="indicator"></div>
          </div>
          <div
            v-if="editing"
            class="menu-container"
            :class="{active: activeTopPage === 'backgrounds'}"
            @click="changeTopPage('backgrounds')"
          >
            <div class="menu-item">
              <div
                class="svg-icon"
                v-html="icons.backgroundsIcon"
              ></div>
            </div>
            <strong v-once>{{ $t('backgrounds') }}</strong>
            <div class="indicator"></div>
          </div>
        </div>
      </div>
      <body-settings
        v-if="activeTopPage === 'body'"
        :editing="editing"
      />
      <skin-settings
        v-if="activeTopPage === 'skin'"
        :editing="editing"
      />
      <hairSettings
        v-if="activeTopPage === 'hair'"
        :editing="editing"
      />
      <extraSettings
        v-if="activeTopPage === 'extra'"
        :editing="editing"
      />
      <div
        v-if="activeTopPage === 'backgrounds'"
        id="backgrounds"
        class="section customize-section pt-4"
      >
        <div class="row justify-content-center title-row mb-3">
          <strong>{{ $t('incentiveBackgrounds') }}</strong>
        </div>
        <div
          v-if="standardBackgrounds.length < standardBackgroundMax"
          class="row justify-content-center title-row mb-3"
        >
          <div>
            {{ $t('incentiveBackgroundsUnlockedWithCheckins') }}
          </div>
        </div>
        <div class="background-row d-flex justify-content-center mb-4">
          <div
            v-for="bg in standardBackgrounds"
            :id="bg.key"
            :key="bg.key"
            class="background-item"
            :class="{ selected: bg.key === user.preferences.background }"
            @click="unlock('background.' + bg.key)"
          >
            <div
              v-if="bg.key === ''"
              class="incentive-background deselect"
            >
            </div>
            <div
              v-else
              class="incentive-background"
              :class="`background_${bg.key}`"
            >
              <div class="small-rectangle"></div>
            </div>
            <b-popover
              :target="bg.key"
              triggers="hover focus"
              placement="bottom"
              :prevent-overflow="false"
              :content="bg.notes(user.preferences.language)"
            />
          </div>
        </div>
        <div
          v-if="user.purchased.background.birthday_bash"
        >
          <div
            class="row justify-content-center title-row mb-3"
          >
            <strong>{{ $t('eventBackgrounds') }}</strong>
          </div>
          <div
            class="background-row d-flex justify-content-center mb-4"
          >
            <div
              v-for="bg in eventBackgrounds"
              :id="bg.key"
              :key="bg.key"
              class="background-item"
              :class="{selected: bg.key === user.preferences.background}"
              @click="unlock('background.' + bg.key)"
            >
              <Sprite
                class="background"
                :image-name="`icon_background_${bg.key}`"
              />
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes(user.preferences.language)"
              />
            </div>
          </div>
        </div>
        <div
          v-if="timeTravelBackgrounds.length > 0"
          :key="`ttbg${timeTravelBackgrounds.length}`"
        >
          <div
            class="row justify-content-center title-row mb-3"
          >
            <strong>{{ $t('timeTravelBackgrounds') }}</strong>
          </div>
          <div
            class="background-row d-flex justify-content-center mb-4"
          >
            <div
              v-for="bg in timeTravelBackgrounds"
              :id="bg.key"
              :key="bg.key"
              class="background-item"
              :class="{selected: bg.key === user.preferences.background}"
              @click="unlock('background.' + bg.key)"
            >
              <Sprite
                class="background"
                :image-name="`icon_background_${bg.key}`"
              />
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes(user.preferences.language)"
              />
            </div>
          </div>
        </div>
        <div
          v-if="monthlyBackgrounds.length > 0"
          :key="`monthly${monthlyBackgrounds.length}`"
        >
          <div
            class="row text-center title-row mb-3"
          >
            <strong>{{ $t('monthlyBackgrounds') }}</strong>
          </div>
          <div class="background-row d-flex justify-content-center mx-auto mb-4 px-5">
            <div
              v-for="(bg) in monthlyBackgrounds"
              :id="bg.key"
              :key="bg.key"
              class="background-item"
              :class="{selected: bg.key === user.preferences.background}"
              @click="unlock('background.' + bg.key)"
            >
              <Sprite
                class="background"
                :image-name="`icon_background_${bg.key}`"
              />
              <b-popover
                :target="bg.key"
                triggers="hover focus"
                placement="bottom"
                :prevent-overflow="false"
                :content="bg.notes(user.preferences.language)"
              />
            </div>
          </div>
        </div>
        <customize-banner class="padding-fix" />
      </div>
    </div>
    <div
      v-if="modalPage === 3 && !editing"
      class="container interests-section"
    >
      <div class="section row">
        <div class="col-12 text-center">
          <h2>{{ $t('wantToWorkOn') }}</h2>
        </div>
      </div>
      <div class="section row">
        <div class="col-6">
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="work"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="work"
              >
              <label
                v-once
                class="custom-control-label"
                for="work"
              >{{ $t('work') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="exercise"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="exercise"
              >
              <label
                v-once
                class="custom-control-label"
                for="exercise"
              >{{ $t('exercise') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="health_wellness"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="health_wellness"
              >
              <label
                v-once
                class="custom-control-label"
                for="health_wellness"
              >{{ $t('health_wellness') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="school"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="school"
              >
              <label
                v-once
                class="custom-control-label"
                for="school"
              >{{ $t('school') }}</label>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="chores"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="chores"
              >
              <label
                v-once
                class="custom-control-label"
                for="chores"
              >{{ $t('chores') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="creativity"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="creativity"
              >
              <label
                v-once
                class="custom-control-label"
                for="creativity"
              >{{ $t('creativity') }}</label>
            </div>
          </div>
          <div class="task-option">
            <div class="custom-control custom-checkbox">
              <input
                id="self_care"
                v-model="taskCategories"
                class="custom-control-input"
                type="checkbox"
                value="self_care"
              >
              <label
                v-once
                class="custom-control-label"
                for="self_care"
              >{{ $t('self_care') }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!editing"
      class="section d-flex justify-content-center justin-outer-section"
      :class="{top: modalPage > 1}"
    >
      <div class="justin-section d-flex align-items-center">
        <div class="featured-label">
          <span class="rectangle"></span>
          <span class="text">Justin</span>
          <span class="rectangle"></span>
        </div>
        <div class="justin-message">
          <div
            class="corner-decoration"
            :style="{top: '-2px', right: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{top: '-2px', left: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{bottom: '-2px', right: '-2px'}"
          ></div>
          <div
            class="corner-decoration"
            :style="{bottom: '-2px', left: '-2px'}"
          ></div>
          <div v-if="modalPage === 1">
            <p
              v-once
              v-html="$t('justinIntroMessage1')"
            ></p>
            <p v-once>
              {{ $t('justinIntroMessageUsername') }}
            </p>
          </div>
          <div v-if="modalPage === 2">
            <p>{{ $t('justinIntroMessageAppearance') }}</p>
          </div>
          <div v-if="modalPage === 3">
            <p v-once>
              {{ $t('justinIntroMessage3') }}
            </p>
          </div>
        </div>
        <div
          class="npc-justin-textbox"
          :style="{'background-image': imageURL}"
        ></div>
      </div>
    </div>
    <div
      v-if="modalPage === 1"
      class="section mr-5 ml-5 first-page-footer"
    >
      <username-form
        :avatar-intro="true"
        @usernameConfirmed="modalPage += 1"
      />
      <div
        class="small text-center"
        v-html="$t('usernameTOSRequirements')"
      ></div>
    </div>
    <div
      v-if="!editing && !(modalPage === 1)"
      class="section container footer"
    >
      <div class="footer-left">
        <div
          v-if="modalPage > 1"
          class="prev-outer"
          @click="prev()"
        >
          <div
            class="prev-arrow svg-icon"
            v-html="icons.arrowLeft"
          ></div>
          <div
            v-once
            class="prev"
          >
            {{ $t('prev') }}
          </div>
        </div>
      </div>
      <div class="footer-center text-center circles">
        <div
          class="circle"
          :class="{active: modalPage === 1}"
        ></div>
        <div
          class="circle"
          :class="{active: modalPage === 2}"
        ></div>
        <div
          class="circle"
          :class="{active: modalPage === 3}"
        ></div>
      </div>
      <div class="footer-right">
        <div
          v-if="modalPage < 3"
          class="next-outer"
          @click="next()"
        >
          <div
            v-once
            class="next"
          >
            {{ $t('next') }}
          </div>
          <div
            class="next-arrow svg-icon"
            v-html="icons.arrowRight"
          ></div>
        </div>
        <div
          v-if="modalPage === 3 && !loading"
          class="next-outer"
          :class="{disabled: taskCategories.length === 0}"
          @click="done()"
        >
          <div
            v-once
            class="next"
          >
            {{ $t('finish') }}
          </div>
          <div
            class="next-arrow svg-icon"
            v-html="icons.arrowRight"
          ></div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  $dialogMarginTop: 56px;
  $userCreationBgHeight:  105px;

  .page-2 {
    &#avatar-modal {
      .modal-dialog.modal-md {
        margin-top: 186px;
      }
    }
  }

  #avatar-modal {
    h2 {
      color: $purple-300;
    }

    .avatar {
      cursor: auto;

      &:not(.new-user)[class*=background] {
        box-shadow: 0px 1px 3px 0px rgba(26, 24, 29, 0.12), 0px 1px 2px 0px rgba(26, 24, 29, 0.24);
      }

      &.new-user {
        padding-top: 0px;
        padding-left: 30px;
      }
    }

    .modal-body {
      padding: 0px;
    }

    .modal-content {
      border-radius: 12px;
    }

    .first-page-footer {
      margin-bottom: 32px;
    }

    .customize-section {
      text-align: center;
      background-color: #f9f9f9;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    #creator-background {
      background-color: $purple-200;
    }

    .corner-decoration {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #ffbe5d;
      border: inherit;
      outline: inherit;
    }

    .small {
      color: $gray-200;
    }

    h3 {
      color: $gray-100;
      font-weight: 700;
      line-height: 24px;
    }

    .padding-fix {
      padding-top: 1px;
    }

    .row.sub-menu + .row.sub-menu {
      margin-top: 0.5em;
    }

    .welcome-section {
      margin-top: 2.5em;
      margin-bottom: 2.5em;

      h3 {
        font-size: 20px;
        font-weight: 400;
        color: $gray-200;
        line-height: 1.71;
      }
    }

    .logo {
      width: 190px;
      margin: 0 auto 1.25em;
    }

    .user-creation-bg {
      background-image: url('~@/assets/creator/creator-hills-bg.png');
      height: $userCreationBgHeight;
      width: 219px;
      margin: 0 auto;
    }

    .top {
      position: absolute;
      top: -80px;
      right: 50%;
      left: 50%;
    }

    .justin-outer-section:not(.top) {
      margin-bottom: 24px;
    }

    .avatar-section {
      margin-bottom: 30px;
    }

    .justin-section {
      position: relative;
    }

    .justin-message {
      border-color: #ffa623;
      border-style: solid;
      border-width: 2px;
      outline-color: #b36213;
      outline-style: solid;
      outline-width: 2px;
      position: relative;
      padding: 2em;
      margin: 2px;
      height: 100%;
      width: 400px;
      background: $gray-700;

      p {
        margin: auto;
      }

      p + p {
        margin-top: 1em;
      }
    }

    .npc-justin-textbox {
      position: absolute;
      right: 1rem;
      top: -3.1rem;
      width: 48px;
      height: 48px;
    }

    .featured-label {
      position: absolute;
      top: -1rem;
      left: 1.5rem;
      border-radius: 2px;
      margin: auto;

      .text {
        font-size: 12px;
        min-height: auto;
        color: $white;
      }
    }

    .circles {
      align-self: flex-end;
    }

    .circle {
      width: 8px;
      height: 8px;
      background-color: #d8d8d8;
      border-radius: 50%;
      display: inline-block;
      margin-right: 1em;

      &:last-of-type {
        margin-right: 0;
      }
    }

    .circle.active {
      background-color: $purple-300;
    }

    .customize-menu {
      .menu-item {
        width: 83px;

        .svg-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto;
        }
      }

      .menu-container {
        color: $gray-100;
      }

      .menu-container:hover, .menu-container.active {
        cursor: pointer;
        color: $purple-300;
      }

      .indicator {
        display: none;
      }

      .menu-container.active .indicator{
        width: 0px;
        height: 0px;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 12px solid $gray-700;
        display: block;
        margin: 0 auto;
      }
    }

    .interests-section {
      margin-top: 3em;
      margin-bottom: 60px;

      .task-option {
        margin: 0 auto;
        width: 70%;
      }
    }

    #backgrounds {
      .background-row {
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .background-item {
        outline: 4px solid transparent;

        .background {
          border-radius: 4px;
          object-position: -4px -4px;
          object-fit: none;
          width: 60px;
          height: 60px;
        }

        .deselect {
          height: 4px;
          display: block;
          opacity: 0.24;
          background: red;
          transform: rotate(-45deg);
          top: 0;
          margin-top: 32px;
          margin-left: -1px;
          border-radius: 0;
        }

        &:hover {
          outline: 4px solid rgba($purple-300, .25);
          border-radius: 4px;
          cursor: pointer;
        }

        &.selected {
          border-radius: 4px;
          outline: 4px solid $purple-300;
        }
      }

      strong {
        margin: 0 auto;
      }

      .incentive-background {
        background-image: none;
        width: 68px;
        height: 68px;
        border-radius: 4px;
        background-color: #92b6bd;
        padding-top: .3em;

        .small-rectangle {
          width: 60px;
          height: 40px;
          border-radius: 4px;
          margin: 0 auto;
          opacity: .6;
          background: white;
        }
      }

      .background_violet {
        background-color: #a993ed;
      }

      .background_blue {
        background-color: #92b6bd;
      }

      .background_green {
        background-color: #92bd94;
      }

      .background_purple {
        background-color: #9397bd;
      }

      .background_red {
        background-color: #b77e80;
      }

      .background_yellow {
        background-color: #bcbb91;
      }

      .incentive-background:hover {
        cursor: pointer;
      }
    }

    .footer {
      margin-top: 24px;
      padding-bottom: 24px;
      padding-left: 24px;
      padding-right: 24px;
      bottom: 0;
      width: 100%;
      display: flex;

      * {
        transition: none !important;
      }

      .footer-left, .footer-right {
        flex: auto;
        flex-grow: 0;
        width: 30%
      }

      .footer-center {
        flex: 1;
      }

      .prev, .next {
        color: $gray-300;
        font-weight: bold;
        display: inline-block;
        padding: 0.4em;
      }

      .prev {
        padding-left: 16px;
      }

      .next {
        padding-right: 16px;
      }

      .prev-outer {
        white-space: nowrap;

        &:hover {
          cursor: pointer;

          .prev {
            color: $purple-300;
          }

          .prev-arrow {
            path {
              fill: $purple-300;
            }
          }
        }
      }

      .prev-arrow, .next-arrow {
        width: 32px;
        height: 32px;
        display: inline-block;
        vertical-align: bottom;
      }

      .next-outer {
        white-space: nowrap;
        flex: 1;
        text-align: right;

        &:hover {
          cursor: pointer;

          .next {
            color: $purple-300;
          }

          .next-arrow {
            path {
              fill: $purple-300;
            }
          }
        }
      }
    }
  }
</style>

<script>
import axios from 'axios';
import forEach from 'lodash/forEach';
import content from '@/../../common/script/content/index';
import { mapState } from '@/libs/store';
import avatar from './avatar';
import usernameForm from './settings/usernameForm';
import guide from '@/mixins/guide';
import notifications from '@/mixins/notifications';
import customizeBanner from './avatarModal/customize-banner';
import bodySettings from './avatarModal/body-settings';
import skinSettings from './avatarModal/skin-settings';
import hairSettings from './avatarModal/hair-settings';
import extraSettings from './avatarModal/extra-settings';
import closeX from './ui/closeX';

import logoPurple from '@/assets/svg/logo-purple.svg';
import bodyIcon from '@/assets/svg/body.svg';
import accessoriesIcon from '@/assets/svg/accessories.svg';
import skinIcon from '@/assets/svg/skin.svg';
import hairIcon from '@/assets/svg/hair.svg';
import backgroundsIcon from '@/assets/svg/backgrounds.svg';
import gem from '@/assets/svg/gem.svg';
import hourglass from '@/assets/svg/hourglass.svg';
import gold from '@/assets/svg/gold.svg';
import arrowRight from '@/assets/svg/arrow_right.svg';
import arrowLeft from '@/assets/svg/arrow_left.svg';
import svgClose from '@/assets/svg/close.svg';
import { avatarEditorUtilities } from '../mixins/avatarEditUtilities';
import Sprite from './ui/sprite';

export default {
  components: {
    avatar,
    closeX,
    customizeBanner,
    bodySettings,
    extraSettings,
    hairSettings,
    skinSettings,
    usernameForm,
    Sprite,
  },
  mixins: [guide, notifications, avatarEditorUtilities],
  data () {
    return {
      loading: false,
      allBackgrounds: content.backgroundsFlat,
      eventBackgrounds: [],
      monthlyBackgrounds: [],
      standardBackgrounds: [],
      standardBackgroundMax: 1,
      timeTravelBackgrounds: [],

      icons: Object.freeze({
        logoPurple,
        bodyIcon,
        accessoriesIcon,
        skinIcon,
        hairIcon,
        backgroundsIcon,
        gem,
        hourglass,
        gold,
        arrowRight,
        arrowLeft,
        close: svgClose,
      }),
      modalPage: 1,
      activeTopPage: 'body',
      activeSubPage: 'size',
      taskCategories: [],
      skinSubMenuItems: [
        {
          id: 'color',
          label: this.$t('color'),
        },
      ],
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      currentEvent: 'worldState.data.currentEvent',
    }),
    editing () {
      return this.$store.state.avatarEditorOptions.editingUser;
    },
    startingPage () {
      return this.$store.state.avatarEditorOptions.startingPage;
    },
    imageURL () {
      return 'url(/static/npc/normal/npc_justin.png)';
    },
  },
  watch: {
    editing () {
      if (this.editing) this.modalPage = 2;
    },
    startingPage () {
      if (!this.$store.state.avatarEditorOptions.startingPage) return;
      this.activeTopPage = this.$store.state.avatarEditorOptions.startingPage;
      this.activeSubPage = this.$store.state.avatarEditorOptions.subpage;
      this.$store.state.avatarEditorOptions.startingPage = '';
      this.$store.state.avatarEditorOptions.subpage = '';
    },
  },
  mounted () {
    this.updateBackgrounds();
    if (this.editing) this.modalPage = 2;
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'avatar-modal');
    },
    updateBackgrounds () {
      this.eventBackgrounds = [];
      this.monthlyBackgrounds = [];
      this.standardBackgrounds = [
        { key: '', notes: () => this.$t('noBackground') },
      ];
      this.timeTravelBackgrounds = [];
      forEach(this.allBackgrounds, bg => {
        if (bg.set === 'incentiveBackgrounds') {
          this.standardBackgroundMax += 1;
        }
        if (this.user.purchased.background[bg.key]) {
          if (bg.set === 'eventBackgrounds') {
            this.eventBackgrounds.push(bg);
          } else if (bg.set === 'incentiveBackgrounds') {
            this.standardBackgrounds.push(bg);
          } else if (bg.set === 'timeTravelBackgrounds') {
            this.timeTravelBackgrounds.push(bg);
          } else {
            this.monthlyBackgrounds.push(bg);
          }
        }
      });
    },
    prev () {
      this.modalPage -= 1;
    },
    next () {
      this.modalPage += 1;
    },
    changeTopPage (page, subpage) {
      if (page === 'backgrounds') {
        this.updateBackgrounds();
      }
      this.activeTopPage = page;
      if (subpage) this.activeSubPage = subpage;
    },
    changeSubPage (page) {
      this.activeSubPage = page;
    },
    async done () {
      this.loading = true;

      let tasksToCreate = [
        ...content.tasksByCategory.defaults.map(t => ({
          ...t,
          text: t.text(),
          notes: t.notes && t.notes(),
        })),
      ];
      this.taskCategories.forEach(category => {
        tasksToCreate = tasksToCreate.concat(content.tasksByCategory[category].map(t => ({
          ...t,
          text: t.text(),
          notes: t.notes && t.notes(),
        })));
      });

      // @TODO: Move to the action
      const response = await axios.post('/api/v4/tasks/user', tasksToCreate);
      const tasks = response.data.data;
      tasks.forEach(task => {
        this.$store.state.user.data.tasksOrder[`${task.type}s`].unshift(task._id);
        this.$store.state.tasks.data[`${task.type}s`].unshift(task);
      });

      this.$root.$emit('bv::hide::modal', 'avatar-modal');
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }

      // NOTE: it's important this flag is set AFTER the onboarding default tasks
      // have been created or it'll break the onboarding guide achievement for creating a task
      this.$store.dispatch('user:set', {
        'flags.welcomed': true,
      });

      // @TODO: This is a timeout to ensure dom is loaded
      window.setTimeout(() => {
        this.initTour();
        this.goto('intro', 0);
      }, 1000);
    },
  },
};
</script>
