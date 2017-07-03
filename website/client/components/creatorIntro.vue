<template lang="pug">
#creator-background
  #creator-modal
    .section.row.welcome-section(v-if='modalPage == 1')
      .col-6.offset-3.text-center
        h3(v-once) {{$t('welcomeTo')}}
        .svg-icon.logo(v-html='icons.logoPurple')

    .section.row
      .col-6.offset-3
        .user-creation-bg
        avatar(:member='user')

    div(v-if='modalPage == 2')
      .section.row
        .col-12.text-center
          button.btn.btn-secondary(v-once) {{$t('randomize')}}
      .section.row.text-center.customize-menu
        .col-3
          .menu-item(@click='changeTopPage("body", "size")')
            .svg-icon(v-html='icons.bodyIcon')
          strong(v-once) {{$t('body')}}
        .col-3
          .menu-item(@click='changeTopPage("skin", "color")')
            .svg-icon(v-html='icons.skinIcon')
          strong(v-once) {{$t('skin')}}
        .col-3
          .menu-item(@click='changeTopPage("hair", "color")')
            .svg-icon(v-html='icons.hairIcon')
          strong(v-once) {{$t('hair')}}
        .col-3
          .menu-item(@click='changeTopPage("extra", "glasses")')
            .svg-icon(v-html='icons.accessoriesIcon')
          strong(v-once) {{$t('extra')}}
      .section.customize-section(v-if='activeTopPage === "body"')
        .row.sub-menu
            .col-2.offset-4.sub-menu-item(@click='changeSubPage("size")', :class='{active: activeSubPage === "size"}')
              strong(v-once) {{$t('size')}}
            .col-2.sub-menu-item(@click='changeSubPage("shirt")', :class='{active: activeSubPage === "shirt"}')
              strong(v-once) {{$t('shirt')}}
        .row(v-if='activeSubPage === "size"')
          .col-12.customize-options.size-options
            .slim_shirt_black.option(@click='set({"preferences.size":"slim"})', :class='{active: user.preferences.size === "slim"}')
            .broad_shirt_black.option(@click='set({"preferences.size":"broad"})', :class='{active: user.preferences.size === "broad"}')
        .row(v-if='activeSubPage === "shirt"')
          .col-12.customize-options
            .slim_shirt_black.option(@click='set({"preferences.shirt":"black"})', :class='{active: user.preferences.shirt === "black"}')
            .slim_shirt_blue.option(@click='set({"preferences.shirt":"blue"})', :class='{active: user.preferences.shirt === "blue"}')
            .slim_shirt_green.option(@click='set({"preferences.shirt":"green"})', :class='{active: user.preferences.shirt === "green"}')
            .slim_shirt_pink.option(@click='set({"preferences.shirt":"pink"})', :class='{active: user.preferences.shirt === "pink"}')
            .slim_shirt_white.option(@click='set({"preferences.shirt":"white"})', :class='{active: user.preferences.shirt === "white"}')
            .slim_shirt_yellow.option(@click='set({"preferences.shirt":"yellow"})', :class='{active: user.preferences.shirt === "yellow"}')

      .section.customize-section(v-if='activeTopPage === "skin"')
        .row.sub-menu
            .col-6.offset-3.text-center.sub-menu-item(:class='{active: activeSubPage === "color"}')
              strong(v-once) {{$t('color')}}
        .row
          .col-12.customize-options
            .skin_ddc994.option(@click='set({"preferences.skin":"ddc994"})', :class='{active: user.preferences.skin === "ddc994"}')
            .skin_f5a76e.option(@click='set({"preferences.skin":"f5a76e"})', :class='{active: user.preferences.skin === "f5a76e"}')
            .skin_ea8349.option(@click='set({"preferences.skin":"ea8349"})', :class='{active: user.preferences.skin === "ea8349"}')
            .skin_c06534.option(@click='set({"preferences.skin":"c06534"})', :class='{active: user.preferences.skin === "c06534"}')
            .skin_98461a.option(@click='set({"preferences.skin":"98461a"})', :class='{active: user.preferences.skin === "98461a"}')
            .skin_915533.option(@click='set({"preferences.skin":"915533"})', :class='{active: user.preferences.skin === "915533"}')
            .skin_c3e1dc.option(@click='set({"preferences.skin":"c3e1dc"})', :class='{active: user.preferences.skin === "c3e1dc"}')
            .skin_6bd049.option(@click='set({"preferences.skin":"6bd049"})', :class='{active: user.preferences.skin === "6bd049"}')

      .section.customize-section(v-if='activeTopPage === "hair"')
        .row.sub-menu
            .col-2.offset-3.text-center.sub-menu-item(@click='changeSubPage("color")', :class='{active: activeSubPage === "color"}')
              strong(v-once) {{$t('color')}}
            .col-2.text-center.sub-menu-item(@click='changeSubPage("bangs")', :class='{active: activeSubPage === "bangs"}')
              strong(v-once) {{$t('bangs')}}
            .col-2.text-center.sub-menu-item(@click='changeSubPage("ponytail")', :class='{active: activeSubPage === "ponytail"}')
              strong(v-once) {{$t('ponytail')}}
        .row(v-if='activeSubPage === "color"')
          .col-12.customize-options
            .hair_bangs_1_white.option(@click='set({"preferences.hair.color": "white"})', :class='{active: user.preferences.hair.color === "white"}')
            .hair_bangs_1_brown.option(@click='set({"preferences.hair.color": "brown"})', :class='{active: user.preferences.hair.color === "brown"}')
            .hair_bangs_1_blond.option(@click='set({"preferences.hair.color": "blond"})', :class='{active: user.preferences.hair.color === "blond"}')
            .hair_bangs_1_red.option(@click='set({"preferences.hair.color": "red"})', :class='{active: user.preferences.hair.color === "red"}')
            .hair_bangs_1_black.option(@click='set({"preferences.hair.color": "black"})', :class='{active: user.preferences.hair.color === "black"}')
        .row(v-if='activeSubPage === "bangs"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.bangs": 0})', :class="[{ active: user.preferences.hair.bangs === 0 }, 'hair_bangs_0_' + user.preferences.hair.color]")
            .option(@click='set({"preferences.hair.bangs": 1})', :class="[{ active: user.preferences.hair.bangs === 1 }, 'hair_bangs_1_' + user.preferences.hair.color]")
            .option(@click='set({"preferences.hair.bangs": 2})',:class="[{ active: user.preferences.hair.bangs === 2 }, 'hair_bangs_2_' + user.preferences.hair.color]")
            .option(@click='set({"preferences.hair.bangs": 3})', :class="[{ active: user.preferences.hair.bangs === 3 }, 'hair_bangs_3_' + user.preferences.hair.color]")
            .option(@click='set({"preferences.hair.bangs": 4})', :class="[{ active: user.preferences.hair.bangs === 4 }, 'hair_bangs_4_' + user.preferences.hair.color]")
        .row(v-if='activeSubPage === "ponytail"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.base": 0})', :class="[{ active: user.preferences.hair.base === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
            .hair_base_1_blond.option(@click='set({"preferences.hair.base": 1})', :class="[{ active: user.preferences.hair.base === 1 }, 'hair_base_1_' + user.preferences.hair.color]")
            .hair_base_3_blond.option(@click='set({"preferences.hair.base": 3})', :class="[{ active: user.preferences.hair.base === 3 }, 'hair_base_3_' + user.preferences.hair.color]")

      .section.container.customize-section(v-if='activeTopPage === "extra"')
        .row.sub-menu
            .col-4.text-center.sub-menu-item(@click='changeSubPage("glasses")', :class='{active: activeSubPage === "glasses"}')
              strong(v-once) {{$t('glasses')}}
            .col-4.text-center.sub-menu-item(@click='changeSubPage("wheelchair")', :class='{active: activeSubPage === "wheelchair"}')
              strong(v-once) {{$t('wheelchair')}}
            .col-4.text-center.sub-menu-item(@click='changeSubPage("flower")', :class='{active: activeSubPage === "flower"}')
              strong(v-once) {{$t('flower')}}
        .row(v-if='activeSubPage === "glasses"')
          .col-12.customize-options
            .eyewear_special_blackTopFrame.option(@click='equip("eyewear_special_blackTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_blackTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_blackTopFrame"}')
            .eyewear_special_blueTopFrame.option(@click='equip("eyewear_special_blueTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_blueTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_blueTopFrame"}')
            .eyewear_special_greenTopFrame.option(@click='equip("eyewear_special_greenTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_greenTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_greenTopFrame"}')
            .eyewear_special_pinkTopFrame.option(@click='equip("eyewear_special_pinkTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_pinkTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_pinkTopFrame"}')
            .eyewear_special_redTopFrame.option(@click='equip("eyewear_special_redTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_redTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_redTopFrame"}')
            .eyewear_special_whiteTopFrame.option(@click='equip("eyewear_special_whiteTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_whiteTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_whiteTopFrame"}')
            .eyewear_special_yellowTopFrame.option(@click='equip("eyewear_special_yellowTopFrame")', :class='{active: user.preferences.costume ? user.items.gear.costume.eyewear === "eyewear_special_yellowTopFrame" : user.items.gear.equipped.eyewear === "eyewear_special_yellowTopFrame"}')
        .row(v-if='activeSubPage === "wheelchair"')
          .col-12.customize-options.weelchairs
            .option(@click='set({"preferences.chair": "none"})', :class='{active: user.preferences.chair === "none"}')
              | None
            .option(@click='set({"preferences.chair": "black"})', :class='{active: user.preferences.chair === "black"}')
              .button_chair_black
            .option(@click='set({"preferences.chair": "blue"})', :class='{active: user.preferences.chair === "blue"}')
              .button_chair_blue
            .option(@click='set({"preferences.chair": "green"})', :class='{active: user.preferences.chair === "green"}')
              .button_chair_green
            .option(@click='set({"preferences.chair": "pink"})', :class='{active: user.preferences.chair === "pink"}')
              .button_chair_pink
            .option(@click='set({"preferences.chair": "red"})', :class='{active: user.preferences.chair === "red"}')
              .button_chair_red
            .option(@click='set({"preferences.chair": "yellow"})', :class='{active: user.preferences.chair === "yellow"}')
              .button_chair_yellow
        .row(v-if='activeSubPage === "flower"')
          .col-12.customize-options
            .head_0.option(@click='set({"preferences.hair.flower":0})', :class='{active: user.preferences.hair.flower === 0}')
            .hair_flower_1.option(@click='set({"preferences.hair.flower":1})', :class='{active: user.preferences.hair.flower === 1}')
            .hair_flower_2.option(@click='set({"preferences.hair.flower":2})', :class='{active: user.preferences.hair.flower === 2}')
            .hair_flower_3.option(@click='set({"preferences.hair.flower":3})', :class='{active: user.preferences.hair.flower === 3}')
            .hair_flower_4.option(@click='set({"preferences.hair.flower":4})', :class='{active: user.preferences.hair.flower === 4}')
            .hair_flower_5.option(@click='set({"preferences.hair.flower":5})', :class='{active: user.preferences.hair.flower === 5}')
            .hair_flower_6.option(@click='set({"preferences.hair.flower":6})', :class='{active: user.preferences.hair.flower === 6}')

    .container.interests-section(v-if='modalPage == 3')
      .section.row
        .col-12.text-center
          h2 I want to work on:
      .section.row
        .col-4.offset-2
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('work') }}
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('excercise') }}
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('health') }}
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('school') }}
        .col-4
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('chores') }}
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('creativity') }}
          div
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('budgeting') }}

    .section.row.justin-message-section(:class='{top: modalPage > 1}')
      .col-9
        .justin-message(v-if='modalPage == 1')
          p(v-once) {{$t('justinIntroMessage1')}}
          p(v-once) {{$t('justinIntroMessage2')}}
        .justin-message(v-if='modalPage > 1')
          p(v-once) {{$t('justinIntroMessage3')}}

    .section.container.footer
      .row
        .col-3.offset-1.text-center
          div(v-if='modalPage > 1', @click='prev()')
            .prev-arrow
            .prev(v-once) {{$t('prev')}}
        .col-4.text-center.circles
          .circle(:class="{active: modalPage === 1}")
          .circle(:class="{active: modalPage === 2}")
          .circle(:class="{active: modalPage === 3}")
        .col-3.text-center
          div(v-if='modalPage < 3', @click='next()')
            .next(v-once) {{$t('next')}}
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

  .justin-message-section.top {
    position: absolute;
    top: -15em;
  }

  .circles {
    padding-left: 2em;
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
      margin: 0 auto;
    }

    .menu-item:hover {
      cursor: pointer;
      svg path, strong {
        stroke: purple !important;
      }
    }
  }

  .sub-menu:hover {
    cursor: pointer;
  }

  .sub-menu-item {
    text-align: center;
  }

  .sub-menu .sub-menu-item:hover, .sub-menu .sub-menu-item.active {
    color: $purple-200;
    border-bottom: 2px solid $purple-200;
  }

  .customize-options .option {
    display: inline-block;
    padding: 2em;
    vertical-align: bottom;
  }

  .size-options {
    padding-left: 9em;
  }

  .weelchairs .option {
    width: 90px;
    height: 90px;
  }

  .option.active {
    border: 4px solid $purple-200;
    border-radius: 4px;
    margin-top: 1em;
  }

  .option:hover {
    cursor: pointer;
  }

  .customize-section {
    background-color: #f9f9f9;
    padding-top: 1em;
    height: 250px;
  }

  .interests-section {
    margin-top: 7em;
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
      this.$store.dispatch('common:equip', {key, type: 'costume'});
    },
  },
};
</script>
