<template lang="pug">
b-modal#avatar-modal(title="", :size='editing ? "lg" : "md"', :hide-header='true', :hide-footer='true', :class='{"page-2": modalPage > 1 && !editing}')
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
        .menu-container(@click='changeTopPage("skin", "color")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "skin"}')
          .menu-item
            .svg-icon(v-html='icons.skinIcon')
          strong(v-once) {{$t('skin')}}
        .menu-container(@click='changeTopPage("hair", "color")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "hair"}')
          .menu-item
            .svg-icon(v-html='icons.hairIcon')
          strong(v-once) {{$t('hair')}}
        .menu-container(@click='changeTopPage("extra", "glasses")', :class='{"col-3": !editing, "col-2": editing, active: activeTopPage === "extra"}')
          .menu-item
            .svg-icon(v-html='icons.accessoriesIcon')
          strong(v-once) {{$t('extra')}}
        .menu-container.col-2(@click='changeTopPage("backgrounds", "2019")', v-if='editing', :class='{active: activeTopPage === "backgrounds"}')
          .menu-item
            .svg-icon(v-html='icons.backgroundsIcon')
          strong(v-once) {{$t('backgrounds')}}
    #body.section.customize-section(v-if='activeTopPage === "body"')
      .row.sub-menu.text-center
        .col-3.offset-3.sub-menu-item(@click='changeSubPage("size")', :class='{active: activeSubPage === "size"}')
          strong(v-once) {{$t('size')}}
        .col-3.sub-menu-item(@click='changeSubPage("shirt")', :class='{active: activeSubPage === "shirt"}')
          strong(v-once) {{$t('shirt')}}
      .row(v-if='activeSubPage === "size"')
        .col-12.customize-options.size-options
          .option(v-for='option in ["slim", "broad"]', :class='{active: user.preferences.size === option}')
            .sprite.customize-option(:class="`${option}_shirt_black`", @click='set({"preferences.size": option})')
      .row(v-if='activeSubPage === "shirt"')
        .col-12.customize-options
          .option(v-for='option in ["black", "blue", "green", "pink", "white", "yellow"]',
            :class='{active: user.preferences.shirt === option}')
            .sprite.customize-option(:class="`slim_shirt_${option}`", @click='set({"preferences.shirt": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='item in specialShirts',
            :class='{active: item.active, locked: item.locked}')
            .sprite.customize-option(:class="`broad_shirt_${item.key}`", @click='item.click')
            .gem-lock(v-if='item.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if='!userOwnsSet("shirt", specialShirtKeys)')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`shirt.${specialShirtKeys.join(",shirt.")}`)') {{ $t('purchaseAll') }}
    #skin.section.customize-section(v-if='activeTopPage === "skin"')
      .row.sub-menu.col-6.offset-3.text-center
        .col-6.offset-3.text-center.sub-menu-item(:class='{active: activeSubPage === "color"}')
          strong(v-once) {{$t('color')}}
      .row
        .col-12.customize-options
          .option(v-for='option in ["ddc994", "f5a76e", "ea8349", "c06534", "98461a", "915533", "c3e1dc", "6bd049"]',
            :class='{active: user.preferences.skin === option}')
            .skin.sprite.customize-option(:class="`skin_${option}`", @click='set({"preferences.skin": option})')
      .row(v-if='editing && set.key !== "undefined"', v-for='set in seasonalSkins')
        .col-12.customize-options
          .option(v-for='option in set.options',
            :class='{active: option.active, locked: option.locked, hide: option.hide}')
            .skin.sprite.customize-option(:class="`skin_${option.key}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
        .col-12.text-center(v-if='!hideSet(set) && !userOwnsSet("skin", set.keys)')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`skin.${set.keys.join(",skin.")}`)') {{ $t('purchaseAll') }}
    #hair.section.customize-section(v-if='activeTopPage === "hair"')
      .row.col-12.sub-menu.text-center
        .col-3.text-center.sub-menu-item(@click='changeSubPage("color")', :class='{active: activeSubPage === "color", "offset-2": !editing}')
          strong(v-once) {{$t('color')}}
        .col-3.text-center.sub-menu-item(@click='changeSubPage("bangs")', :class='{active: activeSubPage === "bangs"}')
          strong(v-once) {{$t('bangs')}}
        .col-3.text-center.sub-menu-item(@click='changeSubPage("style")', :class='{active: activeSubPage === "style"}')
          strong(v-once) {{$t('style')}}
        .col-3.text-center.sub-menu-item(@click='changeSubPage("facialhair")', :class='{active: activeSubPage === "facialhair"}', v-if='editing')
            strong(v-once) {{$t('facialhair')}}
      #hair-color.row(v-if='activeSubPage === "color"')
        .col-12.customize-options
          .option(v-for='option in ["white", "brown", "blond", "red", "black"]',
            :class='{active: user.preferences.hair.color === option}')
            .color-bangs.sprite.customize-option(:class="`hair_bangs_1_${option}`", @click='set({"preferences.hair.color": option})')
        .col-12.customize-options(v-if='editing && set.key !== "undefined"', v-for='set in seasonalHairColors')
          .option(v-for='option in set.options',
            :class='{active: option.active, locked: option.locked, hide: option.hide}')
            .skin.sprite.customize-option(:class="`hair_bangs_1_${option.key}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if='!hideSet(set) && !userOwnsSet("hair", set.keys, "color")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`hair.color.${set.keys.join(",hair.color.")}`)') {{ $t('purchaseAll') }}
      #style.row(v-if='activeSubPage === "style"')
        .col-12.customize-options(v-if='editing')
          .head_0.option(@click='set({"preferences.hair.base": 0})', :class="[{ active: user.preferences.hair.base === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
          .option(v-for='option in baseHair3',
            :class='{active: option.active, locked: option.locked}')
            .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if='!userOwnsSet("hair", baseHair3Keys, "base")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair3Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in baseHair4',
            :class='{active: option.active, locked: option.locked}')
            .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if='!userOwnsSet("hair", baseHair4Keys, "base")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair4Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
        .col-12.customize-options
          .head_0.option(v-if="!editing", @click='set({"preferences.hair.base": 0})', :class="[{ active: user.preferences.hair.base === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
          .option(v-for='option in baseHair1',
            :class='{active: user.preferences.hair.base === option}')
            .base.sprite.customize-option(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
        .col-12.customize-options(v-if='editing')
          .option(v-for='option in baseHair2',
            :class='{active: option.active, locked: option.locked}')
            .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if='!userOwnsSet("hair", baseHair2Keys, "base")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair2Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
      #bangs.row(v-if='activeSubPage === "bangs"')
        .col-12.customize-options
          .head_0.option(@click='set({"preferences.hair.bangs": 0})',
            :class="[{ active: user.preferences.hair.bangs === 0 }, 'hair_bangs_0_' + user.preferences.hair.color]")
          .option(v-for='option in [1, 2, 3, 4]',
            :class='{active: user.preferences.hair.bangs === option}')
            .bangs.sprite.customize-option(:class="`hair_bangs_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.bangs": option})')
      #facialhair.row(v-if='activeSubPage === "facialhair"')
        .col-12.customize-options(v-if='editing')
          .head_0.option(@click='set({"preferences.hair.mustache": 0})', :class="[{ active: user.preferences.hair.mustache === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
          .option(v-for='option in baseHair5',
            :class='{active: option.active, locked: option.locked}')
            .base.sprite.customize-option(:class="`hair_mustache_${option.key}_${user.preferences.hair.color}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
        .col-12.customize-options(v-if='editing')
          .head_0.option(@click='set({"preferences.hair.beard": 0})', :class="[{ active: user.preferences.hair.beard === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
          .option(v-for='option in baseHair6',
            :class='{active: option.active, locked: option.locked}')
            .base.sprite.customize-option(:class="`hair_beard_${option.key}_${user.preferences.hair.color}`", @click='option.click')
            .gem-lock(v-if='option.locked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
          .col-12.text-center(v-if="isPurchaseAllNeeded('hair', ['baseHair5', 'baseHair6'], ['mustache', 'beard'])")
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(`hair.mustache.${baseHair5Keys.join(",hair.mustache.")},hair.beard.${baseHair6Keys.join(",hair.beard.")}`)') {{ $t('purchaseAll') }}
    #extra.section.container.customize-section(v-if='activeTopPage === "extra"')
      .row.sub-menu
        .col-3.offset-1.text-center.sub-menu-item(@click='changeSubPage("glasses")', :class='{active: activeSubPage === "glasses"}')
          strong(v-once) {{ $t('glasses') }}
        .col-4.text-center.sub-menu-item(@click='changeSubPage("wheelchair")', :class='{active: activeSubPage === "wheelchair"}')
          strong(v-once) {{ $t('wheelchair') }}
        .col-3.text-center.sub-menu-item(@click='changeSubPage("flower")', :class='{active: activeSubPage === "flower"}')
          strong(v-once) {{ $t('accent') }}
      .row.sub-menu(v-if='editing')
        .col-4.text-center.sub-menu-item(@click='changeSubPage("ears")' :class='{active: activeSubPage === "ears"}')
          strong(v-once) {{ $t('animalEars') }}
        .col-4.text-center.sub-menu-item(@click='changeSubPage("tails")' :class='{active: activeSubPage === "tails"}')
          strong(v-once) {{ $t('animalTails') }}
        .col-4.text-center.sub-menu-item(@click='changeSubPage("headband")' :class='{active: activeSubPage === "headband"}')
          strong(v-once) {{ $t('headband') }}
      #glasses.row(v-if='activeSubPage === "glasses"')
        .col-12.customize-options
          .option(v-for='option in eyewear', :class='{active: option.active}')
            .sprite.customize-option(:class="`eyewear_special_${option.key}`", @click='option.click')
      #animal-ears.row(v-if='activeSubPage === "ears"')
        .section.col-12.customize-options
          .option(v-for='option in animalItems("headAccessory")',
            :class='{active: option.active, locked: option.locked}')
            .sprite.customize-option(:class="`headAccessory_special_${option.key}`", @click='option.click')
            .gem-lock(v-if='option.gemLocked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
            .gold-lock(v-if='option.goldLocked')
              .svg-icon.gold(v-html='icons.gold')
              span 20
          .col-12.text-center(v-if='!animalItemsOwned("headAccessory")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(animalItemsUnlockString("headAccessory"))') {{ $t('purchaseAll') }}
      #animal-tails.row(v-if='activeSubPage === "tails"')
        .section.col-12.customize-options
          .option(v-for='option in animalItems("back")',
            :class='{active: option.active, locked: option.locked}')
            .sprite.customize-option(:class="`icon_back_special_${option.key}`", @click='option.click')
            .gem-lock(v-if='option.gemLocked')
              .svg-icon.gem(v-html='icons.gem')
              span 2
            .gold-lock(v-if='option.goldLocked')
              .svg-icon.gold(v-html='icons.gold')
              span 20
          .col-12.text-center(v-if='!animalItemsOwned("back")')
            .gem-lock
              .svg-icon.gem(v-html='icons.gem')
              span 5
            button.btn.btn-secondary.purchase-all(@click='unlock(animalItemsUnlockString("back"))') {{ $t('purchaseAll') }}
      #headband.row(v-if='activeSubPage === "headband"')
        .col-12.customize-options
          .option(v-for='option in headbands', :class='{active: option.active}')
            .sprite.customize-option(:class="`headAccessory_special_${option.key}`", @click='option.click')
      #wheelchairs.row(v-if='activeSubPage === "wheelchair"')
        .col-12.customize-options
          .option(@click='set({"preferences.chair": "none"})', :class='{active: user.preferences.chair === "none"}')
            | None
          .option(v-for='option in chairKeys',
            :class='{active: user.preferences.chair === option}')
            .chair.sprite.customize-option(:class="`button_chair_${option}`", @click='set({"preferences.chair": option})')
      #flowers.row(v-if='activeSubPage === "flower"')
        .col-12.customize-options
          .head_0.option(@click='set({"preferences.hair.flower":0})', :class='{active: user.preferences.hair.flower === 0}')
          .option(v-for='option in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]',
            :class='{active: user.preferences.hair.flower === option}')
            .sprite.customize-option(:class="`hair_flower_${option}`", @click='set({"preferences.hair.flower": option})')
      .row(v-if='activeSubPage === "flower"')
        .col-12.customize-options
          // button.customize-option(ng-repeat='item in ::getGearArray("animal")', class='{{::item.key}}',
            ng-class="{locked: user.items.gear.owned[item.key] == undefined, selectableInventory: user.preferences.costume ? user.items.gear.costume.headAccessory == item.key : user.items.gear.equipped.headAccessory == item.key}",
            popover='{{::item.notes()}}', popover-title='{{::item.text()}}', popover-trigger='mouseenter',
            popover-placement='right', popover-append-to-body='true',
            ng-click='user.items.gear.owned[item.key] ? equip(item.key) : purchase(item.type,item)')
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
      .row.sub-menu.col-10.offset-1(v-if='!filterBackgrounds')
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2019")', :class='{active: activeSubPage === "2019"}')
          strong(v-once) 2019
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2018")', :class='{active: activeSubPage === "2018"}')
          strong(v-once) 2018
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2017")', :class='{active: activeSubPage === "2017"}')
          strong(v-once) 2017
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2016")', :class='{active: activeSubPage === "2016"}')
          strong(v-once) 2016
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2015")', :class='{active: activeSubPage === "2015"}')
          strong(v-once) 2015
        .col-2.text-center.sub-menu-item(@click='changeSubPage("2014")', :class='{active: activeSubPage === "2014"}')
          strong(v-once) 2014
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

  .section.d-flex.justify-content-center(:class='{top: modalPage > 1}', v-if='!editing')
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
  .section.mr-5.ml-5(v-if='modalPage === 1')
    username-form(@usernameConfirmed='modalPage += 1', :avatarIntro='true')
    .small.text-center(v-html="$t('usernameTOSRequirements')")

  .section.container.footer(v-if='!editing && !(modalPage === 1)')
    .row
      .col-3.offset-1.text-center
        div(v-if='modalPage > 1', @click='prev()')
          .prev-arrow
          .prev(v-once) {{ $t('prev') }}
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
  /* @TODO do not rely on avatar-modal___BV_modal_body_,
     it already changed once when bootstrap-vue reached version 1 */

  .page-2 #avatar-modal___BV_modal_body_ {
    margin-top: 2rem;
  }

  #avatar-modal___BV_modal_body_, #avatar-modal___BV_modal_body_ {
    padding: 0;
  }

  #avatar-modal .modal-dialog {
    margin-top: 7rem;
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

  .section {
    margin-top: 2em;
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
    height: 105px;
    width: 219px;
    margin: 0 auto;
  }

  .avatar {
    position: absolute;
    top: -22px;
    left: 4em;
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

    .menu-container {
      color: #a5a1ac;
    }

    .menu-container:hover, .menu-container.active {
      cursor: pointer;
      color: #6133B4;
    }
  }

  .sub-menu:hover {
    cursor: pointer;
  }

  .sub-menu-item {
    text-align: center;
    border-bottom: 2px solid #f9f9f9;
  }

  .sub-menu .sub-menu-item:hover, .sub-menu .sub-menu-item.active {
    color: $purple-200;
    border-bottom: 2px solid $purple-200;
  }

  .customize-section {
    text-align: center;
    padding-bottom: 2em;
  }

  .option.hide {
    display: none !important;
  }

  .customize-options .option {
    display: inline-block;
    vertical-align: bottom;
    padding: .5em;
    height: 90px;
    width: 90px;
    margin: 1em .5em .5em 0;
    border: 4px solid $gray-700;
    border-radius: 4px;

    &.locked {
      border: none;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      margin-top: 0;
    }

    .sprite.customize-option {
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

  .option.active {
    border-color: $purple-200;
  }

  .option:hover {
    cursor: pointer;
  }

  .customize-section {
    background-color: #f9f9f9;
    padding-top: 1em;
    min-height: 280px;
  }

  .interests-section {
    margin-top: 3em;

    .task-option {
      margin: 0 auto;
      width: 70%;
    }
  }

  #backgrounds {
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

  .background-button {
      margin-bottom: 15px;
  }

  .background-button:hover {
    span.badge.badge-pill.badge-item.badge-svg.hide {
      display: block;
    }
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import map from 'lodash/map';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import { mapState } from 'client/libs/store';
import avatar from './avatar';
import usernameForm from './settings/usernameForm';
import { getBackgroundShopSets } from '../../common/script/libs/shops';
import unlock from '../../common/script/ops/unlock';
import buy from '../../common/script/ops/buy/buy';
import guide from 'client/mixins/guide';
import notifications from 'client/mixins/notifications';
import appearance from 'common/script/content/appearance';
import appearanceSets from 'common/script/content/appearance/sets';
import toggleSwitch from 'client/components/ui/toggleSwitch';

import logoPurple from 'assets/svg/logo-purple.svg';
import bodyIcon from 'assets/svg/body.svg';
import accessoriesIcon from 'assets/svg/accessories.svg';
import skinIcon from 'assets/svg/skin.svg';
import hairIcon from 'assets/svg/hair.svg';
import backgroundsIcon from 'assets/svg/backgrounds.svg';
import gem from 'assets/svg/gem.svg';
import gold from 'assets/svg/gold.svg';
import pin from 'assets/svg/pin.svg';
import isPinned from 'common/script/libs/isPinned';

const skinsBySet = groupBy(appearance.skin, 'set.key');
const hairColorBySet = groupBy(appearance.hair.color, 'set.key');

const tasksByCategory = {
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
    toggleSwitch,
    usernameForm,
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
      specialShirtKeys: ['convict', 'cross', 'fire', 'horizon', 'ocean', 'purple', 'rainbow', 'redblue', 'thunder', 'tropical', 'zombie'],
      rainbowSkinKeys: ['eb052b', 'f69922', 'f5d70f', '0ff591', '2b43f6', 'd7a9f7', '800ed0', 'rainbow'],
      animalSkinKeys: ['bear', 'cactus', 'fox', 'lion', 'panda', 'pig', 'tiger', 'wolf'],
      premiumHairColorKeys: ['rainbow', 'yellow', 'green', 'purple', 'blue', 'TRUred'],
      baseHair1: [1, 3],
      baseHair2Keys: [2, 4, 5, 6, 7, 8],
      baseHair3Keys: [9, 10, 11, 12, 13, 14],
      baseHair4Keys: [15, 16, 17, 18, 19, 20],
      baseHair5Keys: [1, 2],
      baseHair6Keys: [1, 2, 3],
      animalItemKeys: {
        back: ['bearTail', 'cactusTail', 'foxTail', 'lionTail', 'pandaTail', 'pigTail', 'tigerTail', 'wolfTail'],
        headAccessory: ['bearEars', 'cactusEars', 'foxEars', 'lionEars', 'pandaEars', 'pigEars', 'tigerEars', 'wolfEars'],
      },
      chairKeys: ['black', 'blue', 'green', 'pink', 'red', 'yellow', 'handleless_black', 'handleless_blue', 'handleless_green', 'handleless_pink', 'handleless_red', 'handleless_yellow'],
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
    headbands () {
      let keys = ['blackHeadband', 'blueHeadband', 'greenHeadband', 'pinkHeadband', 'redHeadband', 'whiteHeadband', 'yellowHeadband'];
      let options = keys.map(key => {
        let newKey = `headAccessory_special_${key}`;
        let option = {};
        option.key = key;
        option.active = this.user.preferences.costume ? this.user.items.gear.costume.headAccessory === newKey : this.user.items.gear.equipped.headAccessory === newKey;
        option.click = () => {
          let type = this.user.preferences.costume ? 'costume' : 'equipped';
          return this.equip(newKey, type);
        };
        return option;
      });
      return options;
    },
    eyewear () {
      let keys = [
        'blackTopFrame', 'blueTopFrame', 'greenTopFrame', 'pinkTopFrame', 'redTopFrame', 'whiteTopFrame', 'yellowTopFrame',
        'blackHalfMoon', 'blueHalfMoon', 'greenHalfMoon', 'pinkHalfMoon', 'redHalfMoon', 'whiteHalfMoon', 'yellowHalfMoon',
      ];
      let options = keys.map(key => {
        let newKey = `eyewear_special_${key}`;
        let option = {};
        option.key = key;
        option.active = this.user.preferences.costume ? this.user.items.gear.costume.eyewear === newKey : this.user.items.gear.equipped.eyewear === newKey;
        option.click = () => {
          let type = this.user.preferences.costume ? 'costume' : 'equipped';
          return this.equip(newKey, type);
        };
        return option;
      });
      return options;
    },
    specialShirts () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.specialShirtKeys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'shirt');
      });
      return options;
    },
    rainbowSkins () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.rainbowSkinKeys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'skin');
      });
      return options;
    },
    animalSkins () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.animalSkinKeys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'skin');
      });
      return options;
    },
    seasonalSkins () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      let seasonalSkins = [];
      for (let key in skinsBySet) {
        let set = skinsBySet[key];

        let keys = set.map(item => {
          return item.key;
        });

        let options = keys.map(optionKey => {
          return this.mapKeysToOption(optionKey, 'skin', '', key);
        });

        let text = this.$t(key);
        if (appearanceSets[key] && appearanceSets[key].text) {
          text = appearanceSets[key].text();
        }

        let compiledSet = {
          key,
          options,
          keys,
          text,
        };
        seasonalSkins.push(compiledSet);
      }

      return seasonalSkins;
    },
    seasonalHairColors () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      let seasonalHairColors = [];
      for (let key in hairColorBySet) {
        let set = hairColorBySet[key];

        let keys = set.map(item => {
          return item.key;
        });

        let options = keys.map(optionKey => {
          return this.mapKeysToOption(optionKey, 'hair', 'color', key);
        });

        let text = this.$t(key);
        if (appearanceSets[key] && appearanceSets[key].text) {
          text = appearanceSets[key].text();
        }

        let compiledSet = {
          key,
          options,
          keys,
          text,
        };
        seasonalHairColors.push(compiledSet);
      }

      return seasonalHairColors;
    },
    premiumHairColors () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.premiumHairColorKeys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'color');
      });
      return options;
    },
    baseHair2 () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.baseHair2Keys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'base');
      });
      return options;
    },
    baseHair3 () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.baseHair3Keys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'base');
      });
      return options;
    },
    baseHair4 () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.baseHair4Keys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'base');
      });
      return options;
    },
    baseHair5 () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.baseHair5Keys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'mustache');
      });
      return options;
    },
    baseHair6 () {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.baseHair6Keys;
      let options = keys.map(key => {
        return this.mapKeysToOption(key, 'hair', 'beard');
      });
      return options;
    },
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
    hideSet (set) {
      return moment(appearanceSets[set.key].availableUntil).isBefore(moment());
    },
    purchase (type, key) {
      this.$store.dispatch('shops:purchase', {
        type,
        key,
      });
      this.backgroundUpdate = new Date();
    },
    mapKeysToOption (key, type, subType, set) {
      let userPreference = subType ? this.user.preferences[type][subType] : this.user.preferences[type];
      let userPurchased = subType ? this.user.purchased[type][subType] : this.user.purchased[type];
      let locked = !userPurchased || !userPurchased[key];
      let pathKey = subType ? `${type}.${subType}` : `${type}`;
      let hide = false;

      if (set && appearanceSets[set]) {
        if (locked) hide = moment(appearanceSets[set].availableUntil).isBefore(moment());
      }

      let option = {};
      option.key = key;
      option.active = userPreference === key;
      option.locked = locked;
      option.hide = hide;
      option.click = () => {
        return locked ? this.unlock(`${pathKey}.${key}`) : this.set({[`preferences.${pathKey}`]: key});
      };
      return option;
    },
    userOwnsSet (type, setKeys, subType) {
      let owns = true;

      setKeys.forEach(key => {
        if (subType) {
          if (!this.user.purchased[type] || !this.user.purchased[type][subType] || !this.user.purchased[type][subType][key]) owns = false;
          return;
        }
        if (!this.user.purchased[type][key]) owns = false;
      });

      return owns;
    },
    /**
      * Allows you to find out whether you need the "Purchase All" button or not. If there are more than 2 unpurchased items, returns true, otherwise returns false.
      * @param {string} category - The selected category.
      * @param {string[]} keySets - The items keySets.
      * @param {string[]} [types] - The items types (subcategories). Optional.
      * @returns {boolean} - Determines whether the "Purchase All" button is needed (true) or not (false).
    */
    isPurchaseAllNeeded (category, keySets, types) {
      const purchasedItemsLengths = [];
      // If item types are specified, count them
      if (types && types.length > 0) {
        // Types can be undefined, so we must check them.
        types.forEach((type) => {
          if (this.user.purchased[category][type]) {
            purchasedItemsLengths
              .push(Object.keys(this.user.purchased[category][type]).length);
          }
        });
      } else {
        let purchasedItemsCounter = 0;

        // If types are not specified, recursively
        // search for purchased items in the category
        const findPurchasedItems = (item) => {
          if (typeof item === 'object') {
            Object.values(item)
              .forEach((innerItem) => {
                if (typeof innerItem === 'boolean' && innerItem === true) {
                  purchasedItemsCounter += 1;
                }
                return findPurchasedItems(innerItem);
              });
          }
          return purchasedItemsCounter;
        };

        findPurchasedItems(this.user.purchased[category]);
        if (purchasedItemsCounter > 0) {
          purchasedItemsLengths.push(purchasedItemsCounter);
        }
      }

      // We don't need to count the key sets (below)
      // if there are no purchased items at all.
      if (purchasedItemsLengths.length === 0) {
        return true;
      }

      const allItemsLengths = [];
      // Key sets must be specify correctly.
      keySets.forEach((keySet) => {
        allItemsLengths.push(Object.keys(this[keySet]).length);
      });

      // Simply sum all the length values and
      // write them into variables for the convenience.
      const allItems = allItemsLengths.reduce((acc, val) => acc + val);
      const purchasedItems = purchasedItemsLengths.reduce((acc, val) => acc + val);

      const unpurchasedItems = allItems - purchasedItems;
      return unpurchasedItems > 2;
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
    set (settings) {
      this.$store.dispatch('user:set', settings);
    },
    equip (key, type) {
      this.$store.dispatch('common:equip', {key, type});
    },
    async done () {
      this.loading = true;

      let tasksToCreate = [];
      this.taskCategories.forEach(category => {
        tasksToCreate = tasksToCreate.concat(tasksByCategory[category]);
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

      let loginIncentives = [
        'background.blue',
        'background.green',
        'background.red',
        'background.purple',
        'background.yellow',
        'background.violet',
      ];

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

      await axios.post(`/api/v4/user/unlock?path=${path}`);
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
    async buy (item) {
      const options = {
        currency: 'gold',
        key: item,
        type: 'marketGear',
        quantity: 1,
        pinType: 'marketGear',
      };
      await axios.post(`/api/v4/user/buy/${item}`, options);
      try {
        buy(this.user, {
          params: options,
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
    backgroundPurchased () {
      this.backgroundUpdate = new Date();
    },
    animalItemsUnlockString (category) {
      const keys = this.animalItemKeys[category].map(key => {
        return `items.gear.owned.${category}_special_${key}`;
      });

      return keys.join(',');
    },
    animalItemsOwned (category) {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      let own = true;
      this.animalItemKeys[category].forEach(key => {
        if (this.user.items.gear.owned[`${category}_special_${key}`] === undefined) own = false;
      });
      return own;
    },
    animalItems (category) {
      // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      let keys = this.animalItemKeys[category];
      let options = keys.map(key => {
        let newKey = `${category}_special_${key}`;
        let userPurchased = this.user.items.gear.owned[newKey];

        let option = {};
        option.key = key;
        option.active = this.user.preferences.costume ? this.user.items.gear.costume[category] === newKey : this.user.items.gear.equipped[category] === newKey;
        option.gemLocked = userPurchased === undefined;
        option.goldLocked = userPurchased === false;
        option.locked = option.gemLocked || option.goldLocked;
        option.click = () => {
          if (option.gemLocked) {
            return this.unlock(`items.gear.owned.${newKey}`);
          } else if (option.goldLocked) {
            return this.buy(newKey);
          } else {
            let type = this.user.preferences.costume ? 'costume' : 'equipped';
            return this.equip(newKey, type);
          }
        };
        return option;
      });
      return options;
    },
  },
};
</script>
