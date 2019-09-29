<template lang="pug">
b-modal#avatar-modal(title="", :size='editing ? "lg" : "md"', :hide-header='true', :hide-footer='true', :modal-class="{'page-2':modalPage > 1 && !editing}")
  .section.row.welcome-section(v-if='modalPage === 1 && !editing')
    .col-6.offset-3.text-center
      h3(v-once) {{$t('welcomeTo')}}
      .svg-icon.logo(v-html='icons.logoPurple')

  .avatar-section.row(v-if='modalPage > 1', :class='{"page-2": modalPage === 2}')
    .col-6.offset-3
      .user-creation-bg(v-if='!editing')
      avatar(:member='user', :avatarOnly='!editing', :class='{"edit-avatar": editing}')

  .section(v-if='modalPage === 2', :class='{"edit-modal": editing}')
    // @TODO Implement in V2 .section.row
      .col-12.text-center
        button.btn.btn-secondary(v-once) {{$t('randomize')}}
    #options-nav.container.section.text-center.customize-menu
      .row
        .menu-container(@click='changeTopPage("body", "size")', :class='{"col-3": !editing, "col-2 offset-1": editing, active: activeTopPage === "body"}')
          .menu-item
            .svg-icon(v-html='icons.bodyIcon')
          strong(v-once) {{$t('bodyBody')}}
          .indicator
        .menu-container(@click='changeTopPage("skin", "color")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "skin"}')
          .menu-item
            .svg-icon(v-html='icons.skinIcon')
          strong(v-once) {{$t('skin')}}
          .indicator
        .menu-container(@click='changeTopPage("hair", "color")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "hair"}')
          .menu-item
            .svg-icon(v-html='icons.hairIcon')
          strong(v-once) {{$t('hair')}}
          .indicator
        .menu-container(@click='changeTopPage("extra", "glasses")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "extra"}')
          .menu-item
            .svg-icon(v-html='icons.accessoriesIcon')
          strong(v-once) {{$t('extra')}}
          .indicator
        .menu-container.col-2(@click='changeTopPage("backgrounds", "2019")', v-if='editing', :class='{active: activeTopPage === "backgrounds"}')
          .menu-item
            .svg-icon(v-html='icons.backgroundsIcon')
          strong(v-once) {{$t('backgrounds')}}
          .indicator

    body-settings(
      v-if='activeTopPage === "body"',
      :editing="editing",
    )

    skin-settings(
      v-if='activeTopPage === "skin"',
      :editing="editing",
    )

    hairSettings(
      v-if='activeTopPage === "hair"',
      :editing="editing"
    )

    extraSettings(
      v-if='activeTopPage === "extra"',
      :editing="editing"
    )

    #backgrounds.section.container.customize-section(v-if='activeTopPage === "backgrounds"')
      .row.title-row
        toggle-switch.backgroundFilterToggle(:label="'Hide locked backgrounds'", v-model='filterBackgrounds')
      .row.text-center.title-row(v-if='!filterBackgrounds')
        strong {{backgroundShopSets[0].text}}
      .row.title-row(v-if='!filterBackgrounds')
        .col-12(v-if='showPlainBackgroundBlurb(backgroundShopSets[0].identifier, backgroundShopSets[0].items)') {{ $t('incentiveBackgroundsUnlockedWithCheckins') }}
        .col-2(v-for='bg in backgroundShopSets[0].items',
          @click='unlock("background." + bg.key)',
          :popover-title='bg.text',
          :popover='bg.notes',
          popover-trigger='mouseenter')
          .incentive-background(:class='[`background_${bg.key}`]')
            .small-rectangle
      sub-menu.text-center(:items="bgSubMenuItems", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")
      .row.customize-menu(v-if='!filterBackgrounds' v-for='(sets, key) in backgroundShopSetsByYear')
        .row.background-set(v-for='set in sets', v-if='activeSubPage === key')
          .col-8.offset-2.text-center.set-title
            strong {{set.text}}
          .col-4.text-center.customize-option.background-button(v-for='bg in set.items',
            @click='!user.purchased.background[bg.key] ? backgroundSelected(bg) : unlock("background." + bg.key)',
            :popover-title='bg.text',
            :popover='bg.notes',
            popover-trigger='mouseenter')
            .background(:class='[`background_${bg.key}`, backgroundLockedStatus(bg.key)]')
            i.glyphicon.glyphicon-lock(v-if='!user.purchased.background[bg.key]')
            .purchase-background.single(v-if='!user.purchased.background[bg.key]')
              .svg-icon.gem(v-html='icons.gem')
              span.price 7
            span.badge.badge-pill.badge-item.badge-svg(
              :class="{'item-selected-badge': isBackgroundPinned(bg), 'hide': !isBackgroundPinned(bg)}",
              @click.prevent.stop="togglePinned(bg)",
              v-if='!user.purchased.background[bg.key]'
            )
              span.svg-icon.inline.icon-12.color(v-html="icons.pin")
          .purchase-background.set(v-if='!ownsSet("background", set.items) && set.identifier !== "incentiveBackgrounds"' @click='unlock(setKeys("background", set.items))')
            span.label {{ $t('purchaseAll') }}
            .svg-icon.gem(v-html='icons.gem')
            span.price 15
      .row.customize-menu(v-if='filterBackgrounds')
        .col-4.text-center.customize-option.background-button(v-for='(bg) in ownedBackgrounds'
          @click='unlock("background." + bg.key)',
          :popover-title='bg.text',
          :popover='bg.notes',
          popover-trigger='mouseenter')
          .background(:class='[`background_${bg.key}`, backgroundLockedStatus(bg.key)]'
          )

  .container.interests-section(v-if='modalPage === 3 && !editing')
    .section.row
      .col-12.text-center
        h2 {{ $t('wantToWorkOn') }}
    .section.row
      .col-6
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#work(type="checkbox", value='work', v-model='taskCategories')
            label.custom-control-label(v-once, for="work") {{ $t('work') }}
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#excercise(type="checkbox", value='exercise', v-model='taskCategories')
            label.custom-control-label(v-once, for="excercise") {{ $t('exercise') }}
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#health_wellness(type="checkbox", value='health_wellness', v-model='taskCategories')
            label.custom-control-label(v-once, for="health_wellness") {{ $t('health_wellness') }}
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#school(type="checkbox", value='school', v-model='taskCategories')
            label.custom-control-label(v-once, for="school") {{ $t('school') }}
      .col-6
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#chores(type="checkbox", value='chores', v-model='taskCategories')
            label.custom-control-label(v-once, for="chores") {{ $t('chores') }}
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#creativity(type="checkbox", value='creativity', v-model='taskCategories')
            label.custom-control-label(v-once, for="creativity") {{ $t('creativity') }}
        .task-option
          .custom-control.custom-checkbox
            input.custom-control-input#self_care(type="checkbox", value='self_care', v-model='taskCategories')
            label.custom-control-label(v-once, for="self_care") {{ $t('self_care') }}

  .section.d-flex.justify-content-center.justin-outer-section(:class='{top: modalPage > 1}', v-if='!editing')
    .justin-section.d-flex.align-items-center
      .featured-label
        span.rectangle
        span.text Justin
        span.rectangle
      .justin-message
        .corner-decoration(:style="{top: '-2px', right: '-2px'}")
        .corner-decoration(:style="{top: '-2px', left: '-2px'}")
        .corner-decoration(:style="{bottom: '-2px', right: '-2px'}")
        .corner-decoration(:style="{bottom: '-2px', left: '-2px'}")
        div(v-if='modalPage === 1')
          p(v-once, v-html='$t("justinIntroMessage1")')
          p(v-once) {{ $t('justinIntroMessageUsername') }}
        div(v-if='modalPage === 2')
          p {{ $t('justinIntroMessageAppearance') }}
        div(v-if='modalPage === 3')
          p(v-once) {{ $t('justinIntroMessage3') }}
      .npc-justin-textbox
  .section.mr-5.ml-5.first-page-footer(v-if='modalPage === 1')
    username-form(@usernameConfirmed='modalPage += 1', :avatarIntro='true')
    .small.text-center(v-html="$t('usernameTOSRequirements')")

  .section.container.footer(v-if='!editing && !(modalPage === 1)')
    .footer-left
      div.prev-outer(v-if='modalPage > 1', @click='prev()')
        .prev-arrow.svg-icon(v-html='icons.arrowLeft')
        .prev(v-once) {{ $t('prev') }}
    .footer-center.text-center.circles
      .circle(:class="{active: modalPage === 1}")
      .circle(:class="{active: modalPage === 2}")
      .circle(:class="{active: modalPage === 3}")
    .footer-right
      div.next-outer(v-if='modalPage < 3', @click='next()')
        .next(v-once) {{$t('next')}}
        .next-arrow.svg-icon(v-html='icons.arrowRight')
      div.next-outer(v-if='modalPage === 3 && !loading', @click='done()', :class="{disabled: taskCategories.length === 0}")
        .next(v-once) {{$t('finish')}}
        .next-arrow.svg-icon(v-html='icons.arrowRight')
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  $dialogMarginTop: 56px;
  $userCreationBgHeight:  105px;

  /* @TODO do not rely on avatar-modal___BV_modal_body_,
     it already changed once when bootstrap-vue reached version 1 */

  #avatar-modal___BV_modal_body_, #avatar-modal___BV_modal_body_ {
    padding: 0;
  }

  .page-2 {
    #avatar-modal___BV_modal_body_ {
      margin-top: $dialogMarginTop;
    }

    &#avatar-modal {
      .modal-dialog.modal-md {
        margin-top: 186px;
      }
    }
  }

  #avatar-modal {

    .first-page-footer {
      margin-bottom: 32px;
    }

    .customize-section {
      text-align: center;
      padding-bottom: 2em;
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
      font-size: 20px;
      font-weight: normal;
      color: $gray-200;
    }

    .purchase-all {
      margin-bottom: 1em;
    }

    .edit-modal {
      margin-top: 10em;
    }

    .row.sub-menu + .row.sub-menu {
      margin-top: 0.5em;
    }

    .welcome-section {
      margin-top: 2.5em;
      margin-bottom: 2.5em;
    }

    .logo {
      width: 190px;
      margin: 0 auto 1.25em;
    }

    .user-creation-bg {
      background-image: url('~client/assets/creator/creator-hills-bg.png');
      height: $userCreationBgHeight;
      width: 219px;
      margin: 0 auto;
    }

    .avatar {
      position: absolute !important; // was overwritten in production build
      top: -22px;
      left: 4em;
    }

    .top {
      position: absolute;
      top: -($dialogMarginTop + $userCreationBgHeight - 16px);
      right: 50%;
      left: 50%;
    }

    .justin-outer-section:not(.top) {
      margin-bottom: 24px;
    }

    .avatar-section {
      margin-bottom: 30px;
    }

    .edit-avatar {
      left: 9.2em;
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
      background-image: url('~client/assets/images/justin_textbox.png');
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
      .menu-item .svg-icon {
        width: 32px;
        height: 32px;
        margin: 0 auto;
      }

      .menu-container {
        color: #a5a1ac;
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


    .text-center {
      .gem-lock, .gold-lock {
        display: inline-block;
        margin-right: 1em;
        margin-bottom: 1.6em;
        vertical-align: bottom;
      }
    }

    .gem-lock, .gold-lock {
      .svg-icon {
        width: 16px;
      }

      span {
        font-weight: bold;
        margin-left: .5em;
      }

      .svg-icon, span {
        display: inline-block;
        vertical-align: bottom;
      }
    }

    .gem-lock span {
      color: $green-10
    }

    .gold-lock span {
      color: $yellow-10
    }

    .customize-section {
      background-color: #f9f9f9;
      min-height: 280px;
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
      padding-top: 12px;

      .title-row {
        margin-bottom: 1em;
      }

      .backgroundFilterToggle {
        margin-left: auto;
        margin-right: auto;
      }

      .set-title {
        margin-top: 1em;
        margin-bottom: 1em;
      }

      .background {
        margin: 0 auto;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
        border-radius: 2px;
      }

      strong {
        margin: 0 auto;
      }

      .incentive-background {
        background-image: none;
        width: 68px;
        height: 68px;
        border-radius: 8px;
        background-color: #92b6bd;
        margin: 0 auto;
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

      .background:hover {
        cursor: pointer;
      }

      .purchase-background {
        margin: 0 auto;
        background: #fff;
        padding: 0.5em;
        border-radius: 0 0 2px 2px;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
        cursor: pointer;

        span {
          font-weight: bold;
          font-size: 12px;
        }

        span.price {
          color: #24cc8f;
        }

        .gem, .coin {
          width: 16px;
        }

        &.single {
          width: 141px;
        }

        &.set {
          width: 100%;

          span {
            font-size: 14px;
          }

          .gem, .coin {
            width: 20px;
          }
        }
      }

      .gem, .coin {
        margin: 0 .5em;
        display: inline-block;
        vertical-align: bottom;
      }

      .background-set {
        width: 100%;
        margin: 10px;
        background-color: #edecee;
        border-radius: 2px;
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

    .badge-svg {
      left: calc((100% - 18px) / 2);
      cursor: pointer;
      color: $gray-400;
      background: $white;
      padding: 4.5px 6px;

      &.item-selected-badge {
        background: $purple-300;
        color: $white;
      }
    }

    .icon-12 {
      width: 12px;
      height: 12px;
    }

    span.badge.badge-pill.badge-item.badge-svg:not(.item-selected-badge) {
      color: #a5a1ac;
    }

    span.badge.badge-pill.badge-item.badge-svg.hide {
      display: none;
    }

    .background-button {
      margin-bottom: 15px;
    }

    .background-button:hover {
      span.badge.badge-pill.badge-item.badge-svg.hide {
        display: block;
      }
    }
  }
</style>

<script>
import axios from 'axios';
import map from 'lodash/map';
import { mapState } from 'client/libs/store';
import avatar from './avatar';
import usernameForm from './settings/usernameForm';
import { getBackgroundShopSets } from '../../common/script/libs/shops';
import guide from 'client/mixins/guide';
import notifications from 'client/mixins/notifications';
import toggleSwitch from 'client/components/ui/toggleSwitch';
import bodySettings from './avatarModal/body-settings';
import skinSettings from './avatarModal/skin-settings';
import hairSettings from './avatarModal/hair-settings';
import extraSettings from './avatarModal/extra-settings';
import subMenu from './avatarModal/sub-menu';

import logoPurple from 'assets/svg/logo-purple.svg';
import bodyIcon from 'assets/svg/body.svg';
import accessoriesIcon from 'assets/svg/accessories.svg';
import skinIcon from 'assets/svg/skin.svg';
import hairIcon from 'assets/svg/hair.svg';
import backgroundsIcon from 'assets/svg/backgrounds.svg';
import gem from 'assets/svg/gem.svg';
import gold from 'assets/svg/gold.svg';
import pin from 'assets/svg/pin.svg';
import arrowRight from 'assets/svg/arrow_right.svg';
import arrowLeft from 'assets/svg/arrow_left.svg';
import isPinned from 'common/script/libs/isPinned';
import {avatarEditorUtilies} from '../mixins/avatarEditUtilities';

import content from 'common/script/content/index';

export default {
  mixins: [guide, notifications, avatarEditorUtilies],
  components: {
    avatar,
    toggleSwitch,
    usernameForm,
    bodySettings,
    skinSettings,
    hairSettings,
    extraSettings,

    subMenu,
  },
  mounted () {
    if (this.editing) this.modalPage = 2;
    // Buy modal is global, so we listen at root. I'd like to not
    this.$root.$on('buyModal::boughtItem', this.backgroundPurchased);
  },
  data () {
    let backgroundShopSets = getBackgroundShopSets();

    return {
      loading: false,
      backgroundShopSets,
      backgroundUpdate: new Date(),
      filterBackgrounds: false,

      icons: Object.freeze({
        logoPurple,
        bodyIcon,
        accessoriesIcon,
        skinIcon,
        hairIcon,
        backgroundsIcon,
        gem,
        pin,
        gold,
        arrowRight,
        arrowLeft,
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

      bgSubMenuItems: ['2019', '2018', '2017', '2016', '2015', '2014'].map(y =>
        ({
          id: y,
          label: y,
        })
      ),
    };
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
  computed: {
    ...mapState({user: 'user.data'}),


    editing () {
      return this.$store.state.avatarEditorOptions.editingUser;
    },
    startingPage () {
      return this.$store.state.avatarEditorOptions.startingPage;
    },
    backgroundShopSetsByYear () {
      // @TODO: add dates to backgrounds
      let backgroundShopSetsByYear = {
        2014: [],
        2015: [],
        2016: [],
        2017: [],
        2018: [],
        2019: [],
      };

      // Hack to force update for now until we restructure the data
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      this.backgroundShopSets.forEach((set) => {
        let year = set.identifier.substr(set.identifier.length - 4);
        if (!backgroundShopSetsByYear[year]) return;

        let setOwnedByUser = false;
        for (let key in set.items) {
          if (this.user.purchased.background[key]) setOwnedByUser = true;
        }
        set.userOwns = setOwnedByUser;

        backgroundShopSetsByYear[year].push(set);
      });
      return backgroundShopSetsByYear;
    },
    ownedBackgrounds () {
      let ownedBackgrounds = [];

      // Hack to force update for now until we restructure the data
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      this.backgroundShopSets.forEach((set) => {
        set.items.forEach((bg) => {
          if (this.user.purchased.background[bg.key]) {
            ownedBackgrounds.push(bg);
          }
        });
      });
      return ownedBackgrounds;
    },
  },
  methods: {
    purchase (type, key) {
      this.$store.dispatch('shops:purchase', {
        type,
        key,
      });
      this.backgroundUpdate = new Date();
    },
    prev () {
      this.modalPage -= 1;
    },
    next () {
      this.modalPage += 1;
    },
    changeTopPage (page, subpage) {
      this.activeTopPage = page;
      if (subpage) this.activeSubPage = subpage;
    },
    changeSubPage (page) {
      this.activeSubPage = page;
    },
    async done () {
      this.loading = true;

      let tasksToCreate = [
        ...content.tasksByCategory.defaults.map(t =>  ({
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
      let response = await axios.post('/api/v4/tasks/user', tasksToCreate);
      let tasks = response.data.data;
      tasks.forEach(task => {
        this.$store.state.user.data.tasksOrder[`${task.type}s`].unshift(task._id);
        this.$store.state.tasks.data[`${task.type}s`].unshift(task);
      });

      this.$root.$emit('bv::hide::modal', 'avatar-modal');
      this.$router.push('/');
      this.$store.dispatch('user:set', {
        'flags.welcomed': true,
      });

      // @TODO: This is a timeout to ensure dom is loaded
      window.setTimeout(() => {
        this.initTour();
        this.goto('intro', 0);
      }, 1000);
    },
    showPlainBackgroundBlurb (identifier, set) {
      return identifier === 'incentiveBackgrounds' && !this.ownsSet('background', set);
    },
    ownsSet (type, set) {
      let setOwnedByUser = false;

      for (let key in set) {
        let value = set[key];
        if (type === 'background') key = value.key;
        if (this.user.purchased[type][key]) setOwnedByUser = true;
      }

      return setOwnedByUser;
    },
    setKeys (type, _set) {
      return map(_set, (v, k) => {
        if (type === 'background') k = v.key;
        return `${type}.${k}`;
      }).join(',');
    },
    backgroundLockedStatus (bgKey) {
      let backgroundClass = 'background-locked';
      if (this.user.purchased.background[bgKey]) backgroundClass = 'background-unlocked';
      return backgroundClass;
    },
    isBackgroundPinned (bg) {
      return isPinned(this.user, bg);
    },
    togglePinned (bg) {
      if (!this.$store.dispatch('user:togglePinnedItem', {type: bg.pinType, path: bg.path})) {
        this.text(this.$t('unpinnedItem', {item: bg.text}));
      }
    },
    backgroundSelected (bg) {
      this.$root.$emit('buyModal::showItem', bg);
    },
    backgroundPurchased () {
      this.backgroundUpdate = new Date();
    },
  },
};
</script>
