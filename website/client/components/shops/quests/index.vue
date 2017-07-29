<template lang="pug">
  .row.market
    .standard-sidebar
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in categories",
            :key="category.identifier",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.identifier].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ category.text }}

        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hideLocked') }}
          toggle-switch.float-right.no-margin(
            :label="''",
            v-model="hideLocked",
          )
        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hidePinned') }}
          toggle-switch.float-right.no-margin(
            :label="''",
            v-model="hidePinned",
          )
    .standard-page
      div.featuredItems
        .background
          div.npc
            div.featured-label
              span.rectangle
              span.text Ian
              span.rectangle
          div.content
            div.featured-label.with-border
              span.rectangle
              span.text(v-once) {{ $t('featuredItems') }}
              span.rectangle

            div.items.margin-center
              shopItem(
                v-for="item in featuredItems",
                :key="item.key",
                :item="item",
                :price="item.goldValue ? item.goldValue : item.value",
                :priceType="item.goldValue ? 'gold' : 'gem'",
                :itemContentClass="'inventory_quest_scroll_'+item.key",
                :emptyItem="false",
                :popoverPosition="'top'",
                @click="selectedGearToBuy = item"
              )
                template(slot="popoverContent", scope="ctx")
                  div
                    h4.popover-content-title {{ item.text() }}
                    .popover-content-text {{ item.notes() }}

      h1.mb-0.page-header(v-once) {{ $t('quests') }}

      .clearfix
        h2.float-left
          | {{ $t('items') }}

        div.float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t(selectedSortItemsBy)", right=true)
            b-dropdown-item(
              v-for="sort in sortItemsBy",
              @click="selectedSortItemsBy = sort",
              :active="selectedSortItemsBy === sort",
              :key="sort"
            ) {{ $t(sort) }}


      div(
        v-for="category in categories",
        v-if="viewOptions[category.identifier].selected"
      )
        h4 {{ category.text }}

        itemRows(
          v-if="category.identifier === 'pet'",
          :items="questItems(category, selectedSortItemsBy, searchTextThrottled, hideLocked, hidePinned)",
          :itemWidth=94,
          :itemMargin=24,
          :showAllLabel="$t('showAllGeneric', { type: category.text })",
          :showLessLabel="$t('showLessGeneric', { type: category.text })"
        )
          template(slot="item", scope="ctx")
            shopItem(
              :key="ctx.item.key",
              :item="ctx.item",
              :price="ctx.item.value",
              :priceType="ctx.item.currency",
              :itemContentClass="ctx.item.class",
              :emptyItem="false",
              @click="selectedItemToBuy = ctx.item"
            )
              span(slot="popoverContent", scope="ctx")
                div
                  h4.popover-content-title {{ ctx.item.text }}
                  .popover-content-text {{ ctx.item.notes }}

              template(slot="itemBadge", scope="ctx")
                span.badge.badge-pill.badge-item.badge-svg(
                  :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                  @click.prevent.stop="togglePinned(ctx.item)"
                )
                  span.svg-icon.inline.icon-12.color(v-html="icons.pin")


        div.items(v-else)
          shopItem(
            v-for="item in questItems(category, selectedSortItemsBy, searchTextThrottled, hideLocked, hidePinned)",
            :key="item.key",
            :item="item",
            :price="item.value",
            :priceType="item.currency",
            :itemContentClass="item.class",
            :emptyItem="false",
            :popoverPosition="'top'",
            @click="selectedItemToBuy = item"
          )
            span(slot="popoverContent")
              div
                h4.popover-content-title {{ item.text }}
                .popover-content-text {{ item.notes }}
              div {{ item }}

            template(slot="itemBadge", scope="ctx")
              span.badge.badge-pill.badge-item.badge-svg(
                :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                @click.prevent.stop="togglePinned(ctx.item)"
              )
                span.svg-icon.inline.icon-12.color(v-html="icons.pin")

    buyModal(
      :item="selectedItemToBuy",
      :priceType="selectedItemToBuy ? selectedItemToBuy.currency : ''",
      :withPin="true",
      @change="resetItemToBuy($event)"
    )
      template(slot="item", scope="ctx")
        item.flat(
          :item="ctx.item",
          :itemContentClass="ctx.item.class",
          :showPopover="false"
        )
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

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

  span.badge.badge-pill.badge-item.badge-svg:not(.item-selected-badge) {
    color: #a5a1ac;
  }

  span.badge.badge-pill.badge-item.badge-svg.hide {
    display: none;
  }

  .item:hover {
    span.badge.badge-pill.badge-item.badge-svg.hide {
      display: block;
    }
  }

  .icon-12 {
    width: 12px;
    height: 12px;
  }

  .hand-cursor {
    cursor: pointer;
  }

  .featuredItems {
    height: 216px;

    .background {
      background: url('~assets/images/shops/quest_shop__banner_background_web.png');

      background-repeat: repeat-x;

      width: 100%;
      height: 216px;
      position: absolute;

      top: 0;
      left: 0;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .content {
      display: flex;
      flex-direction: column;
    }

    .npc {
      position: absolute;
      left: 0;
      width: 100%;
      height: 216px;
      background: url('~assets/images/shops/quest_shop__banner_web_iannpc.png');
      background-repeat: no-repeat;

      .featured-label {
        position: absolute;
        bottom: -14px;
        margin: 0;
        left: 70px;
      }
    }
  }

  .featured-label {
    margin: 24px auto;
  }

  .bordered {
    border-radius: 2px;
    background-color: #f9f9f9;
    margin-bottom: 24px;
    padding: 24px 24px 10px;
  }

  .market {
    .avatar {
      cursor: default;
      margin: 0 auto;

      .character-sprites span {
        left: 25px;
      }
    }

    .standard-page {
      position: relative;
    }
  }
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import Drawer from 'client/components/ui/drawer';
  import DrawerSlider from 'client/components/ui/drawerSlider';
  import DrawerHeaderTabs from 'client/components/ui/drawerHeaderTabs';
  import ItemRows from 'client/components/ui/itemRows';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import Avatar from 'client/components/avatar';

  import BuyModal from '../buyModal.vue';
  import bPopover from 'bootstrap-vue/lib/components/popover';
  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

  import svgPin from 'assets/svg/pin.svg';
  import svgInformation from 'assets/svg/information.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import featuredItems from 'common/script/content/shop-featuredItems';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _map from 'lodash/map';
  import _throttle from 'lodash/throttle';

export default {
    components: {
      ShopItem,
      Item,
      CountBadge,
      Drawer,
      DrawerSlider,
      DrawerHeaderTabs,
      ItemRows,
      toggleSwitch,

      bPopover,
      bDropdown,
      bDropdownItem,

      Avatar,
      BuyModal,
    },
    watch: {
      searchText: _throttle(function throttleSearch () {
        this.searchTextThrottled = this.searchText.toLowerCase();
      }, 250),
    },
    data () {
      return {
        viewOptions: {},

        searchText: null,
        searchTextThrottled: null,

        icons: Object.freeze({
          pin: svgPin,
          information: svgInformation,
          warrior: svgWarrior,
          wizard: svgWizard,
          rogue: svgRogue,
          healer: svgHealer,
        }),

        selectedDrawerTab: 0,
        selectedDrawerItemType: 'eggs',

        sortItemsBy: ['AZ', 'sortByNumber'],
        selectedSortItemsBy: 'AZ',

        selectedItemToBuy: null,

        hideLocked: false,
        hidePinned: false,
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        market: 'shops.market.data',
        quests: 'shops.quests.data',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),
      categories () {
        if (this.quests) {
          this.quests.categories.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
            });
          });

          return this.quests.categories;
        } else {
          return [];
        }
      },

      featuredItems () {
        console.info(this.content.quests);
        return featuredItems.quests.map(i => {
          return this.content.quests[i];
        });
      },
    },
    methods: {
      questItems (category, sortBy, searchBy, hideLocked, hidePinned) {
        let result = _filter(category.items, (i) => {
          if (hideLocked && i.locked) {
            return false;
          }
          if (hidePinned && i.pinned) {
            return false;
          }

          return !searchBy || i.text.toLowerCase().indexOf(searchBy) !== -1;
        });

        switch (sortBy) {
          case 'AZ': {
            result = _sortBy(result, ['text']);

            break;
          }
          case 'sortByNumber': {
            result = _sortBy(result, ['value']);

            break;
          }
        }

        return result;
      },
      resetItemToSell ($event) {
        if (!$event) {
          this.selectedItemToSell = null;
        }
      },
      resetGearToBuy ($event) {
        if (!$event) {
          this.selectedGearToBuy = null;
        }
      },
      resetItemToBuy ($event) {
        if (!$event) {
          this.selectedItemToBuy = null;
        }
      },
      isGearLocked (gear) {
        if (gear.value > this.userStats.gp) {
          return true;
        }

        return false;
      },
      memberOverrideAvatarGear (gear) {
        return {
          [gear.type]: gear.key,
        };
      },
      togglePinned (item) {
        let isPinned = Boolean(item.pinned);
        item.pinned = !isPinned;
        this.$store.dispatch(isPinned ? 'shops:unpinGear' : 'shops:pinGear', {key: item.key});
      },
    },
    created () {
      this.$store.dispatch('shops:fetchQuests');
    },
  };
</script>
