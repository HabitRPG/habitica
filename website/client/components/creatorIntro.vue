<template lang="pug">
b-modal#avatar-modal(title="", size='lg', :hide-header='true', :hide-footer='true', :class='{"page-2": modalPage > 1 && !editing}')
  .section.row.welcome-section(v-if='modalPage === 1 && !editing')
    .col-6.offset-3.text-center
      h3(v-once) {{$t('welcomeTo')}}
      .svg-icon.logo(v-html='icons.logoPurple')

  .section.avatar-section.row(:class='{"page-2": modalPage === 2}')
    .col-6.offset-3
      .user-creation-bg
      avatar(:member='user', :avatarOnly='!editing')

  .section(v-if='modalPage === 2')
    // @TODO Implement in V2 .section.row
      .col-12.text-center
        button.btn.btn-secondary(v-once) {{$t('randomize')}}
    .container.section.text-center.customize-menu
      .row
        div(:class='{"col-3": !editing, "col-2 offset-1": editing}')
          .menu-item(@click='changeTopPage("body", "size")')
            .svg-icon(v-html='icons.bodyIcon')
          strong(v-once) {{$t('body')}}
        div(:class='{"col-3": !editing, "col-2": editing}')
          .menu-item(@click='changeTopPage("skin", "color")')
            .svg-icon(v-html='icons.skinIcon')
          strong(v-once) {{$t('skin')}}
        div(:class='{"col-3": !editing, "col-2": editing}')
          .menu-item(@click='changeTopPage("hair", "color")')
            .svg-icon(v-html='icons.hairIcon')
          strong(v-once) {{$t('hair')}}
        div(:class='{"col-3": !editing, "col-2": editing}')
          .menu-item(@click='changeTopPage("extra", "glasses")')
            .svg-icon(v-html='icons.accessoriesIcon')
          strong(v-once) {{$t('extra')}}
        .col-2(v-if='editing')
          .menu-item(@click='changeTopPage("backgrounds", "2017")')
            .svg-icon(v-html='icons.backgroundsIcon')
          strong(v-once) {{$t('backgrounds')}}

    .section.customize-section(v-if='activeTopPage === "body"')
      .row.sub-menu.col-6.offset-3.text-center
          .col-2.offset-4.sub-menu-item(@click='changeSubPage("size")', :class='{active: activeSubPage === "size"}')
            strong(v-once) {{$t('size')}}
          .col-2.sub-menu-item(@click='changeSubPage("shirt")', :class='{active: activeSubPage === "shirt"}')
            strong(v-once) {{$t('shirt')}}
      .row(v-if='activeSubPage === "size"')
        .col-12.customize-options.size-options
          .option(v-for='option in ["slim", "broad"]', :class='{active: user.preferences.size === option}')
            .sprite(:class="`${option}_shirt_black`", @click='set({"preferences.size": option})')
      .row(v-if='activeSubPage === "shirt"')
        .col-12.customize-options
          .option(v-for='option in ["black", "blue", "green", "pink", "white", "yellow"]', :class='{active: user.preferences.shirt === option}')
            .sprite(:class="`slim_shirt_${option}`", @click='set({"preferences.shirt": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["convict", "cross", "fire", "horizon", "ocean", "purple", "rainbow", "redblue", "thunder", "tropical", "zombie"]',
            :class='{active: user.preferences.shirt === option}')
            .sprite(:class="`broad_shirt_${option}`", @click='set({"preferences.shirt": option})')

    .section.customize-section(v-if='activeTopPage === "skin"')
      .row.sub-menu.col-6.offset-3.text-center
          .col-6.offset-3.text-center.sub-menu-item(:class='{active: activeSubPage === "color"}')
            strong(v-once) {{$t('color')}}
      .row
        .col-12.customize-options
          .option(v-for='option in ["ddc994", "f5a76e", "ea8349", "c06534", "98461a", "915533", "c3e1dc", "6bd049"]',
            :class='{active: user.preferences.skin === option}')
            .skin.sprite(:class="`skin_${option}`", @click='set({"preferences.skin": option})')
      .row(v-if='editing')
        .col-12.customize-options
          .option(v-for='option in ["eb052b", "f69922", "f5d70f", "0ff591", "2b43f6", "d7a9f7", "800ed0", "rainbow"]',
            :class='{active: user.preferences.skin === option}')
            .skin.sprite(:class="`skin_${option}`", @click='set({"preferences.skin": option})')
      .row(v-if='editing')
        .col-12.customize-options
          .option(v-for='option in ["bear", "cactus", "fox", "lion", "panda", "pig", "tiger", "wolf"]',
            :class='{active: user.preferences.skin === option}')
            .skin.sprite(:class="`skin_${option}`", @click='set({"preferences.skin": option})')

    .section.customize-section(v-if='activeTopPage === "hair"')
      .row.sub-menu.col-6.offset-3.text-center
          .col-2.offset-3.text-center.sub-menu-item(@click='changeSubPage("color")', :class='{active: activeSubPage === "color"}')
            strong(v-once) {{$t('color')}}
          .col-2.text-center.sub-menu-item(@click='changeSubPage("bangs")', :class='{active: activeSubPage === "bangs"}')
            strong(v-once) {{$t('bangs')}}
          .col-3.text-center.sub-menu-item(@click='changeSubPage("ponytail")', :class='{active: activeSubPage === "ponytail"}')
            strong(v-once) {{$t('ponytail')}}
      .row(v-if='activeSubPage === "color"')
        .col-12.customize-options
          .option(v-for='option in ["white", "brown", "blond", "red", "black"]',
            :class='{active: user.preferences.hair.color === option}')
            .color-bangs.sprite(:class="`hair_bangs_1_${option}`", @click='set({"preferences.hair.color": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["rainbow", "yellow", "green", "purple", "blue", "TRUred"]',
            :class='{active: user.preferences.hair.color === option}')
            .color-bangs.sprite(:class="`hair_bangs_1_${option}`", @click='set({"preferences.hair.color": option})')

      .row(v-if='activeSubPage === "bangs"')
        .col-12.customize-options
          .head_0.option(@click='set({"preferences.hair.bangs": 0})',
            :class="[{ active: user.preferences.hair.bangs === 0 }, 'hair_bangs_0_' + user.preferences.hair.color]")
          .option(v-for='option in ["1", "2", "3", "4"]',
            :class='{active: user.preferences.hair.bangs === option}')
            .bangs.sprite(:class="`hair_bangs_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.bangs": option})')
      .row(v-if='activeSubPage === "ponytail"')
        .col-12.customize-options
          .head_0.option(@click='set({"preferences.hair.base": 0})', :class="[{ active: user.preferences.hair.base === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
          .option(v-for='option in ["1", "3"]',
            :class='{active: user.preferences.hair.base === option}')
            .base.sprite(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["2", "4", "5", "6", "7", "8"]',
            :class='{active: user.preferences.hair.base === option}')
            .base.sprite(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["9", "10", "11", "12", "13", "14"]',
            :class='{active: user.preferences.hair.base === option}')
            .base.sprite(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["15", "16", "17", "18", "19", "20"]',
            :class='{active: user.preferences.hair.base === option}')
            .base.sprite(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["1", "2", "3"]',
            :class='{active: user.preferences.hair.beard === option}')
            .base.sprite(:class="`hair_beard_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.beard": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["1", "2"]',
            :class='{active: user.preferences.hair.mustache === option}')
            .base.sprite(:class="`hair_mustache_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.mustache": option})')

    .section.container.customize-section(v-if='activeTopPage === "extra"')
      .row.sub-menu.col-6.offset-3.text-center
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
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in ["bearEars", "cactusEars", "foxEars", "lionEars", "pandaEars", "pigEars", "tigerEars", "wolfEars"]',
            :class='{active: user.preferences.costume ? user.items.gear.costume.headAccessory === `eyewear_special_${option}` : user.items.gear.equipped.headAccessory === `eyewear_special_${option}`}')
            .sprite(:class="`.eyewear_special_${option}`", @click='equip(`eyewear_special_${option}`)')

      .row(v-if='activeSubPage === "wheelchair"')
        .col-12.customize-options.weelchairs
          .option(@click='set({"preferences.chair": "none"})', :class='{active: user.preferences.chair === "none"}')
            | None
          .option(v-for='option in ["black", "blue", "green", "pink", "red", "yellow"]',
            :class='{active: user.preferences.chair === option}')
            .chair.sprite(:class="`button_chair_${option}`", @click='set({"preferences.chair": option})')
      .row(v-if='activeSubPage === "flower"')
        .col-12.customize-options
          .head_0.option(@click='set({"preferences.hair.flower":0})', :class='{active: user.preferences.hair.flower === 0}')
          .option(v-for='option in ["1", "2", "3", "4", "5", "6"]',
            :class='{active: user.preferences.hair.flower === option}')
            .sprite(:class="`hair_flower_${option}`", @click='set({"preferences.hair.flower": option})')
      .row(v-if='activeSubPage === "flower"')
        .col-12.customize-options
          // button.customize-option(ng-repeat='item in ::getGearArray("animal")', class='{{::item.key}}',
            ng-class="{locked: user.items.gear.owned[item.key] == undefined, selectableInventory: user.preferences.costume ? user.items.gear.costume.headAccessory == item.key : user.items.gear.equipped.headAccessory == item.key}",
            popover='{{::item.notes()}}', popover-title='{{::item.text()}}', popover-trigger='mouseenter',
            popover-placement='right', popover-append-to-body='true',
            ng-click='user.items.gear.owned[item.key] ? equip(item.key) : purchase(item.type,item)')

    #backgrounds.section.container.customize-section(v-if='activeTopPage === "backgrounds"')
      .row.col-12.text-center.set-title
        strong {{backgroundShopSets[0].text}}
      .row.incentive-background-row
        .col-2(v-for='bg in backgroundShopSets[0].items',
            @click='unlock("background." + bg.key)',
            :popover-title='bg.text',
            :popover='bg.notes',
            popover-trigger='mouseenter')
            .incentive-background(:class='[`background_${bg.key}`]')
              .small-rectangle
      .row.sub-menu.col-6.offset-3
          .col-3.text-center.sub-menu-item(@click='changeSubPage("2017")', :class='{active: activeSubPage === "2017"}')
            strong(v-once) 2017
          .col-3.text-center.sub-menu-item(@click='changeSubPage("2016")', :class='{active: activeSubPage === "2016"}')
            strong(v-once) 2016
          .col-3.text-center.sub-menu-item(@click='changeSubPage("2015")', :class='{active: activeSubPage === "2015"}')
            strong(v-once) 2015
          .col-3.text-center.sub-menu-item(@click='changeSubPage("2014")', :class='{active: activeSubPage === "2014"}')
            strong(v-once) 2014
      .row.customize-menu(v-for='(sets, key) in backgroundShopSetsByYear')
        .col-12.row(v-for='set in sets', v-if='activeSubPage === key')
          .col-6.offset-3.text-center.set-title
            strong {{set.text}}
          .col-12(v-if='showPlainBackgroundBlurb(set.identifier, set.items)') {{ $t('incentiveBackgroundsUnlockedWithCheckins') }}
          .col-4.text-center.customize-option.background-button(v-for='bg in set.items',
            @click='backgroundSelected(bg)',
            :popover-title='bg.text',
            :popover='bg.notes',
            popover-trigger='mouseenter')
            .background(:class='[`background_${bg.key}`, backgroundLockedStatus(bg.key)]')
            i.glyphicon.glyphicon-lock(v-if='!user.purchased.background[bg.key]')
            .purchase-single(v-if='!user.purchased.background[bg.key]')
              .svg-icon.gem(v-html='icons.gem')
              span 7
            span.badge.badge-pill.badge-item.badge-svg(
              :class="{'item-selected-badge': isBackgroundPinned(bg), 'hide': !isBackgroundPinned(bg)}",
              @click.prevent.stop="togglePinned(bg)"
            )
              span.svg-icon.inline.icon-12.color(v-html="icons.pin")

          .col-12.text-center(v-if='!ownsSet("background", set.items) && set.identifier !== "incentiveBackgrounds"')
            .gem-amount
              .svg-icon.gem(v-html='icons.gem')
              span 15
            button.btn.btn-secondary(@click='unlock(setKeys("background", set.items))') Purchase Set

  .container.interests-section(v-if='modalPage === 3 && !editing')
    .section.row
      .col-12.text-center
        h2 I want to work on:
    .section.row
      .col-4.offset-2
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='work', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('work') }}
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='exercise', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('exercise') }}
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='health_wellness', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('health_wellness') }}
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='school', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('school') }}
      .col-4
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='chores', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('chores') }}
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='creativity', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('creativity') }}
        .task-option
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", value='self_care', v-model='taskCategories')
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t('self_care') }}

  .section.row.justin-message-section(:class='{top: modalPage > 1}', v-if='!editing')
    .col-12
      .justin-message
        .featured-label
          span.rectangle
          span.text Justin
          span.rectangle
        .npc_justin_textbox
        div(v-if='modalPage === 1')
          p(v-once) {{$t('justinIntroMessage1')}}
          p(v-once) {{$t('justinIntroMessage2')}}
        div(v-if='modalPage === 2')
          p So how would you like to look? Don’t worry, you can change this later.
        div(v-if='modalPage === 3')
          p(v-once) {{$t('justinIntroMessage3')}}

  .section.container.footer(v-if='!editing')
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
        div(v-if='modalPage === 3', @click='done()')
          button.btn.btn-primary.next(v-once, v-if='!loading') {{$t('done')}}
</template>

<style>
  .page-2 #avatar-modal__BV_body_ {
    margin-top: 8em;
  }

  .page-2 .modal-content {
    margin-top: 7em;
  }

  #avatar-modal_modal_body, #avatar-modal__BV_body_ {
    padding: 0;
  }
</style>

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

  .avatar-section.page-2 {
    min-height: 150px;
  }

  .welcome-section {
    margin-top: 5em;
    margin-bottom: 5em;
  }

  .logo {
    width: 190px;
    margin: 0 auto;
  }

  .user-creation-bg {
    background-image: url('~client/assets/creator/creator-hills-bg.png');
    height: 105px;
    width: 219px;
    margin: 0 auto;
  }

  .avatar {
    position: absolute;
    top: -23px;
    left: 9.2em;
  }

  .justin-message {
    background-image: url('~client/assets/svg/for-css/tutorial-border.svg');
    height: 144px;
    width: 400px;
    padding: 2em;
    margin: 0 auto;
    position: relative;

    .featured-label {
      position: absolute;
      top: -1em;

      .text {
        min-height: auto;
        color: $white;
      }
    }

    .npc_justin_textbox {
      position: absolute;
      right: 1em;
      top: -3.6em;
      width: 48px;
      height: 52px;
      background-image: url('~client/assets/images/justin_textbox.png');
    }
  }

  .justin-message-section {
    margin-top: 6em;
    margin-bottom: 6em;
  }

  .justin-message-section.top {
    position: absolute;
    top: -16em;
    left: 13em;
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
      color: #6133B4;
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

  .customize-section {
    text-align: center;
  }

  .customize-options .option {
    display: inline-block;
    vertical-align: bottom;
    width: 90px;
    height: 90px;

    .sprite {
      margin-top: -2em;
      margin-left: -1em;
    }

    .skin {
      margin-top: -.5em;
    }

    .chair {
      margin-top: 1em;
      margin-left: 1em;
    }

    .hair {
      margin-top: 0em;
      margin-left: -2em;
    }

    .color-bangs {
      margin-top: 0em;
      margin-left: -1em;
    }

    .bangs {
      margin-top: 0em;
      margin-left: -1em;
    }

    .base {
      margin-top: -1em;
      margin-left: -2em;
    }
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
    min-height: 250px;
  }

  .interests-section {
    margin-top: 7em;

    .task-option {
      margin: 0 auto;
      width: 70%;
    }
  }

  #backgrounds {
    .set-title {
      margin-top: 3em;
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

    .incentive-background-row {
      margin-bottom: 2em;
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

    .purchase-single {
      width: 141px;
      margin: 0 auto;
      background: #fff;
      padding: 0.5em;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      border-radius: 0 0 2px 2px;

      span {
        font-weight: bold;
        font-size: 12px;
        color: #24cc8f;
      }

      .gem {
        width: 16px;
      }
    }

    .gem {
      margin-right: .5em;
      display: inline-block;
      vertical-align: bottom;
    }

    .gem-amount {
      margin-top: 2em;
      margin-bottom: 1em;

      .gem {
        width: 24px;
      }

      span {
        font-weight: bold;
        font-size: 20px;
        color: #24cc8f;
      }
    }
  }

  .footer {
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

  .background-button:hover {
    span.badge.badge-pill.badge-item.badge-svg.hide {
      display: block;
    }
  }
</style>

<script>
import axios from 'axios';
import map from 'lodash/map';
import get from 'lodash/get';
import { mapState } from 'client/libs/store';
import avatar from './avatar';
import { getBackgroundShopSets } from '../../common/script/libs/shops';
import unlock from '../../common/script/ops/unlock';
import guide from 'client/mixins/guide';
import notifications from 'client/mixins/notifications';

import bModal from 'bootstrap-vue/lib/components/modal';

import logoPurple from 'assets/svg/logo-purple.svg';
import bodyIcon from 'assets/svg/body.svg';
import accessoriesIcon from 'assets/svg/accessories.svg';
import skinIcon from 'assets/svg/skin.svg';
import hairIcon from 'assets/svg/hair.svg';
import backgroundsIcon from 'assets/svg/backgrounds.svg';
import gem from 'assets/svg/gem.svg';
import pin from 'assets/svg/pin.svg';
import isPinned from 'common/script/libs/isPinned';

let tasksByCategory = {
  work: [
    {
      type: 'habit',
      text: 'Process email',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Most important task >> Worked on today’s most important task',
      notes: 'Tap to specify your most important task',
    },
    {
      type: 'todo',
      text: 'Work project >> Complete work project',
      notes: 'Tap to specify the name of your current project + set a due date!',
    },
  ],
  exercise: [
    {
      type: 'habit',
      text: '10 min cardio >> + 10 minutes cardio',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Stretching >> Daily workout routine',
      notes: 'Tap to choose your schedule and specify exercises!',
    },
    {
      type: 'todo',
      text: 'Set up workout schedule',
      notes: 'Tap to add a checklist!',
    },
  ],
  health_wellness: [ // eslint-disable-line
    {
      type: 'habit',
      text: 'Eat Health/Junk Food',
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: 'Floss',
      notes: 'Tap to make any changes!',
    },
    {
      type: 'todo',
      text: 'Schedule check-up >> Brainstorm a healthy change',
      notes: 'Tap to add checklists!',
    },
  ],
  school: [
    {
      type: 'habit',
      text: 'Study/Procrastinate',
      up: true,
      down: true,
    },
    {
      type: 'daily',
      text: 'Finish homework',
      notes: 'Tap to choose your homework schedule!',
    },
    {
      type: 'todo',
      text: 'Finish assignment for class',
      notes: 'Tap to name the assignment and choose a due date!]',
    },
  ],
  self_care: [ // eslint-disable-line
    {
      type: 'habit',
      text: 'Take a short break',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: '5 minutes of quiet breathing',
      notes: 'Tap to choose your schedule!',
    },
    {
      type: 'todo',
      text: 'Engage in a fun activity',
      notes: 'Tap to specify what you plan to do!',
    },
  ],
  chores: [
    {
      type: 'habit',
      text: '10 minutes cleaning',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Wash dishes',
      notes: 'Tap to choose your schedule!',
    },
    {
      type: 'todo',
      text: 'Organize closet >> Organize clutter',
      notes: 'Tap to specify the cluttered area!',
    },
  ],
  creativity: [
    {
      type: 'habit',
      text: 'Study a master of the craft >> + Practiced a new creative technique',
      up: true,
      down: false,
    },
    {
      type: 'daily',
      text: 'Work on creative project',
      notes: 'Tap to specify the name of your current project + set the schedule!',
    },
    {
      type: 'todo',
      text: 'Finish creative project',
      notes: 'Tap to specify the name of your project',
    },
  ],
};

export default {
  mixins: [guide, notifications],
  components: {
    avatar,
    bModal,
  },
  mounted () {
    if (this.editing) this.modalPage = 2;
  },
  data () {
    let backgroundShopSets = getBackgroundShopSets();

    return {
      loading: false,
      backgroundShopSets,
      backgroundUpdate: new Date(),
      icons: Object.freeze({
        logoPurple,
        bodyIcon,
        accessoriesIcon,
        skinIcon,
        hairIcon,
        backgroundsIcon,
        gem,
        pin,
      }),
      modalPage: 1,
      activeTopPage: 'body',
      activeSubPage: 'size',
      taskCategories: [],
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
      this.$store.dispatch('common:equip', {key, type: 'equipped'});
      this.user.items.gear.equipped[key] = !this.user.items.gear.equipped[key];
    },
    async done () {
      this.loading = true;

      let tasksToCreate = [];
      this.taskCategories.forEach(category => {
        tasksToCreate = tasksToCreate.concat(tasksByCategory[category]);
      });

      // @TODO: Move to the action
      let response = await axios.post('/api/v3/tasks/user', tasksToCreate);
      let tasks = response.data.data;
      tasks.forEach(task => {
        this.$store.state.user.data.tasksOrder[`${task.type}s`].unshift(task._id);
        this.$store.state.tasks.data[`${task.type}s`].unshift(task);
      });

      this.$root.$emit('hide::modal', 'avatar-modal');
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
    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like User.preferences.skin=abc <-> User.purchased.skin.abc.
     *  Pass in this paramater as "skin.abc". Alternatively, pass as an array ["skin.abc", "skin.xyz"] to unlock sets
     */
    async unlock (path) {
      let fullSet = path.indexOf(',') !== -1;
      let isBackground = path.indexOf('background.') !== -1;

      let cost;

      if (isBackground) {
        cost = fullSet ? 3.75 : 1.75; // (Backgrounds) 15G per set, 7G per individual
      } else {
        cost = fullSet ? 1.25 : 0.5; // (Hair, skin, etc) 5G per set, 2G per individual
      }

      let loginIncentives = ['background.blue', 'background.green', 'background.red', 'background.purple', 'background.yellow', 'background.violet'];
      if (loginIncentives.indexOf(path) === -1) {
        if (fullSet) {
          if (confirm(this.$t('purchaseFor', {cost: cost * 4})) !== true) return;
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        } else if (!get(this.user, `purchased.${path}`)) {
          if (confirm(this.$t('purchaseFor', {cost: cost * 4})) !== true) return;
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        }
      }

      await axios.post(`/api/v3/user/unlock?path=${path}`);
      try {
        unlock(this.user, {
          query: {
            path,
          },
        });
        this.backgroundUpdate = new Date();
      } catch (e) {
        alert(e.message);
      }
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
  },
};
</script>
