<template lang="pug">
#creator-background
  #creator-modal
    .section.row.welcome-section(v-if='modalPage == 1')
      .col-6.offset-3.text-center
        h3 Welcome to
        .svg-icon.logo(v-html='icons.logoPurple')

    .section.row
      .col-6.offset-3
        .user-creation-bg
        avatar(:member='user')

    div(v-if='modalPage == 2')
      .section.row
        .col-12.text-center
          button.btn.btn-secondary Randomize
      .section.row.text-center.customize-menu
        .col-3
          .menu-item(@click='changeTopPage("body", "size")')
            .svg-icon(v-html='icons.bodyIcon')
          strong Body
        .col-3
          .menu-item(@click='changeTopPage("skin")')
            .svg-icon(v-html='icons.skinIcon')
          strong Skin
        .col-3
          .menu-item(@click='changeTopPage("hair", "color")')
            .svg-icon(v-html='icons.hairIcon')
          strong Hair
        .col-3
          .menu-item(@click='changeTopPage("extra", "glasses")')
            .svg-icon(v-html='icons.accessoriesIcon')
          strong Extra
      .section.customize-section(v-if='activeTopPage === "body"')
        .row.sub-menu
            .col-2.offset-4(@click='changeSubPage("size")')
              strong Size
            .col-2(@click='changeSubPage("shirt")')
              strong Shirt
        .row(v-if='activeSubPage === "size"')
          .col-12.customize-options
            .slim_shirt_black.option(@click='set({"preferences.size":"slim"})')
            .broad_shirt_black.option(@click='set({"preferences.size":"broad"})')
        .row(v-if='activeSubPage === "shirt"')
          .col-12.customize-options
            .slim_shirt_black.option(@click='set({"preferences.shirt":"black"})')
            .slim_shirt_blue.option(@click='set({"preferences.shirt":"blue"})')
            .slim_shirt_green.option(@click='set({"preferences.shirt":"green"})')
            .slim_shirt_pink.option(@click='set({"preferences.shirt":"pink"})')
            .slim_shirt_white.option(@click='set({"preferences.shirt":"white"})')
            .slim_shirt_yellow.option(@click='set({"preferences.shirt":"yellow"})')

      .section.customize-section(v-if='activeTopPage === "skin"')
        .row.sub-menu
            .col-6.offset-3.text-center
              strong Color
        .row
          .col-12.customize-options
            .skin_ddc994.option(@click='set({"preferences.skin":"ddc994"})')
            .skin_f5a76e.option(@click='set({"preferences.skin":"f5a76e"})')
            .skin_ea8349.option(@click='set({"preferences.skin":"ea8349"})')
            .skin_c06534.option(@click='set({"preferences.skin":"c06534"})')
            .skin_98461a.option(@click='set({"preferences.skin":"98461a"})')
            .skin_915533.option(@click='set({"preferences.skin":"915533"})')
            .skin_c3e1dc.option(@click='set({"preferences.skin":"c3e1dc"})')
            .skin_6bd049.option(@click='set({"preferences.skin":"6bd049"})')

      .section.customize-section(v-if='activeTopPage === "hair"')
        .row.sub-menu
            .col-2.offset-3.text-center(@click='changeSubPage("color")')
              strong Color
            .col-2.text-center(@click='changeSubPage("bangs")')
              strong Bangs
            .col-2.text-center(@click='changeSubPage("ponytail")')
              strong Ponytail
        .row(v-if='activeSubPage === "color"')
          .col-12.customize-options
            .hair_bangs_1_white.option(@click='set({"preferences.hair.color": "white"})')
            .hair_bangs_1_brown.option(@click='set({"preferences.hair.color": "brown"})')
            .hair_bangs_1_blond.option(@click='set({"preferences.hair.color": "blond"})')
            .hair_bangs_1_red.option(@click='set({"preferences.hair.color": "red"})')
            .hair_bangs_1_black.option(@click='set({"preferences.hair.color": "black"})')
        .row(v-if='activeSubPage === "bangs"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.bangs": 0})')
            .hair_bangs_1_blond.option(@click='set({"preferences.hair.bangs": 1})')
            .hair_bangs_2_blond.option(@click='set({"preferences.hair.bangs": 2})')
            .hair_bangs_3_blond.option(@click='set({"preferences.hair.bangs": 3})')
            .hair_bangs_4_blond.option(@click='set({"preferences.hair.bangs": 4})')
        .row(v-if='activeSubPage === "ponytail"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.base": 0})')
            .hair_base_1_blond.option(@click='set({"preferences.hair.base": 1})')
            .hair_base_3_blond.option(@click='set({"preferences.hair.base": 3})')

      .section.customize-section(v-if='activeTopPage === "extra"')
        .row.sub-menu
            .col-2.offset-3.text-center(@click='changeSubPage("glasses")')
              strong Glasses
            .col-2.text-center(@click='changeSubPage("wheelchair")')
              strong Wheelchair
            .col-2.text-center(@click='changeSubPage("flower")')
              strong Flower
        .row(v-if='activeSubPage === "glasses"')
          .col-12.customize-options
            .eyewear_special_blackTopFrame.option(@click='equip("eyewear_special_blackTopFrame")')
            .eyewear_special_blueTopFrame.option(@click='equip("eyewear_special_blueTopFrame")')
            .eyewear_special_greenTopFrame.option(@click='equip("eyewear_special_greenTopFrame")')
            .eyewear_special_pinkTopFrame.option(@click='equip("eyewear_special_pinkTopFrame")')
            .eyewear_special_redTopFrame.option(@click='equip("eyewear_special_redTopFrame")')
            .eyewear_special_whiteTopFrame.option(@click='equip("eyewear_special_whiteTopFrame")')
            .eyewear_special_yellowTopFrame.option(@click='equip("eyewear_special_yellowTopFrame")')
        .row(v-if='activeSubPage === "wheelchair"')
          .col-12.customize-options
            .option(@click='set({"preferences.chair": "none"})')
              | None
            .button_chair_black.option(@click='set({"preferences.chair": "black"})')
            .button_chair_blue.option(@click='set({"preferences.chair": "blue"})')
            .button_chair_green.option(@click='set({"preferences.chair": "green"})')
            .button_chair_pink.option(@click='set({"preferences.chair": "pink"})')
            .button_chair_red.option(@click='set({"preferences.chair": "red"})')
            .button_chair_yellow.option(@click='set({"preferences.chair": "yellow"})')
        .row(v-if='activeSubPage === "flower"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.flower":0})')
            .hair_flower_1.option(@click='set({"preferences.hair.flower":1})')
            .hair_flower_2.option(@click='set({"preferences.hair.flower":2})')
            .hair_flower_3.option(@click='set({"preferences.hair.flower":3})')
            .hair_flower_4.option(@click='set({"preferences.hair.flower":4})')
            .hair_flower_5.option(@click='set({"preferences.hair.flower":5})')
            .hair_flower_6.option(@click='set({"preferences.hair.flower":6})')

    div(v-if='modalPage == 3')
      .section.row
        .col-12
          h2 I want to work on:
      .section.row
        .col-6
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}
        .col-6
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}

    .section.row.justin-message-section(v-if='modalPage == 1')
      .col-9
        .justin-message
          p Hello there! You must be new here. My name is Justin, I’ll be your guide in Habitica.
          p To start, you’ll need to create an avatar.

    .section.row.footer
      .col-3.offset-1.text-center
        div(v-if='modalPage > 1', @click='prev()')
          .prev-arrow
          .prev Prev
      .col-3.offset-1.text-center
        .circle(:class="{active: modalPage === 1}")
        .circle(:class="{active: modalPage === 2}")
        .circle(:class="{active: modalPage === 3}")
      .col-3.text-center
        div(v-if='modalPage < 3', @click='next()')
          .next Next
          .next-arrow
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  #creator-background {
    background-color: $purple-200;
  }

  #creator-modal {
    width: 448px;
    height: 670px;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 16px 0 rgba(26, 24, 29, 0.32);
    margin: 0 auto;
    padding-top: 1em;
    position: relative;
  }

  .section {
    margin-top: 2em;
  }

  .welcome-section {
    margin-top: 5em;
    margin-bottom: 5em;
  }

  .logo {
    width: 190px;
  }

  .user-creation-bg {
    background-image: url('~client/assets/creator/creator-hills-bg.png');
    height: 105px;
    width: 219px;
  }

  .avatar {
    position: absolute;
    top: -23px;
    left: 48px;
  }

  .justin-message {
    background-image: url('~client/assets/svg/for-css/tutorial-border.svg');
    height: 144px;
    width: 400px;
    padding: 2em;
    margin-left: 1.5em;
  }

  .justin-message-section {
    margin-top: 6em;
    margin-bottom: 6em;
  }

  .circle {
    width: 8px;
    height: 8px;
    background-color: #d8d8d8;
    border-radius: 50%;
    display: inline-block;
    margin-right: 1em;
  }

  .circle.active {
    background-color: #bda8ff;
  }

  .customize-menu {
    .menu-item .svg-icon {
      width: 32px;
      height: 32px;

      svg {
        fill: #A5A1AC;
      }
    }

    .menu-item .svg-icon:hover {
      cursor: pointer;
      svg {
        fill: purple;
      }
    }
  }

  .sub-menu:hover {
    cursor: pointer;
  }

  .customize-options .option {
    float: left;
  }

  .option:hover {
    cursor: pointer;
  }

  .customize-section {
    background-color: #f9f9f9;
    padding-top: 1em;
    height: 250px;
  }

  .footer {
    position: absolute;
    padding-bottom: 1em;
    bottom: 0;
    width: 100%;

    .prev {
      color: #a5a1ac;
      font-weight: bold;
      display: inline-block;
      padding: 0.4em;
      margin-left: 1em;
    }

    .prev:hover, .prev-arrow:hover {
      cursor: pointer;
    }

    .prev-arrow {
      background-image: url('~client/assets/creator/prev.png');
      width: 32px;
      height: 32px;
      display: inline-block;
      vertical-align: bottom;
    }

    .next {
      color: #6133b4;
      font-weight: bold;
      display: inline-block;
      padding: 0.4em;
      margin-right: 1em;
    }

    .next:hover, .next-arrow:hover {
      cursor: pointer;
    }

    .next-arrow {
      background-image: url('~client/assets/creator/arrow.png');
      width: 32px;
      height: 32px;
      display: inline-block;
      vertical-align: bottom;
    }
  }
</style>

<script>
// @TODO: Wait for my other PR (login/register) to fix the background and hiding the header

import { mapState } from 'client/libs/store';
import avatar from './avatar';

import logoPurple from 'assets/svg/logo-purple.svg';
import bodyIcon from 'assets/svg/body.svg';
import accessoriesIcon from 'assets/svg/accessories.svg';
import skinIcon from 'assets/svg/skin.svg';
import hairIcon from 'assets/svg/hair.svg';

export default {
  components: {
    avatar,
  },
  data () {
    return {
      icons: Object.freeze({
        logoPurple,
        bodyIcon,
        accessoriesIcon,
        skinIcon,
        hairIcon,
      }),
      modalPage: 1,
      activeTopPage: 'body',
      activeSubPage: 'size',
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
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
    set (settings) {
      this.$store.dispatch('user:set', settings);
    },
    equip (key) {
      this.$store.dispatch('common:equip', {key});
    },
  },
};
</script>
