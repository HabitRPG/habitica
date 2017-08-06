<template lang="pug">
  .row.seasonal
    .standard-sidebar
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in filterCategories",
            :key="category.key",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.key].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t(category.localeKey+'Capitalized') }}

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
              span.text Leslie
              span.rectangle
          div.content(v-if="featuredSet")
            div.featured-label.with-border
              span.rectangle
              span.text(v-once) {{ $t('featuredset', { name: featuredSet.text }) }}
              span.rectangle

            div.items.margin-center
              shopItem(
                v-for="item in featuredSet.items",
                :key="item.key",
                :item="item",
                :price="item.value",
                :priceType="item.currency",
                :itemContentClass="item.class",
                :emptyItem="false",
                :popoverPosition="'top'",
                @click="selectedItemToBuy = item"
              )
                template(slot="popoverContent", scope="ctx")
                  div
                    h4.popover-content-title {{ item.text }}
                    .popover-content-text {{ item.notes }}

      h1.mb-0.page-header(v-once) {{ $t('seasonalShop') }}

      .clearfix
        h2.float-left
          | {{ $t('classArmor') }}

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
        v-for="(groupSets, categoryGroup) in getGroupedCategories(categories)",
      )
        h3.classgroup
          span.svg-icon.inline(v-html="icons[categoryGroup]")
          span.name(:class="categoryGroup") {{ getClassName(categoryGroup) }}

        div.grouped-parent
          div.group(
            v-for="category in groupSets"
          )
            h3 {{ category.text }}
            div.items
              shopItem(
                v-for="item in seasonalItems(category, selectedSortItemsBy, searchTextThrottled, viewOptions, hidePinned)",
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
      @change="resetItemToBuy($event)",
      @buyPressed="buyItem($event)",
      @togglePinned="togglePinned($event)"
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


  .featured-label {
    margin: 24px auto;
  }

  .bordered {
    border-radius: 2px;
    background-color: #f9f9f9;
    margin-bottom: 24px;
    padding: 24px 24px 10px;
  }

  .group {
    display: inline-block;
    width: 50%;
    margin-bottom: 24px;


    .items {
      border-radius: 2px;
      background-color: #edecee;
      display: inline-block;
      padding: 8px;
    }

    .item-wrapper {
      margin-bottom: 0;
    }

    .items > div:not(:last-of-type) {
      margin-right: 16px;
    }
  }

  .seasonal {
    .standard-page {
      position: relative;
    }

    h3.classgroup {
      line-height: 1.5;
      display: flex;
      align-items: center;

      span.svg-icon.inline {
        height: 24px;
        width: 24px;
        margin-right: 8px;
      }
    }

    .healer {
      color: #cf8229;
    }

    .rogue {
      color: #4f2a93;
    }

    .warrior {
      color: #b01515;
    }

    .wizard {
      color: #1f6ea2;
    }

    .featuredItems {
      height: 216px;

      .background {
        background: url('~assets/images/shops/seasonal_shop_closed_banner_web_background.png');

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
        background: url('~assets/images/shops/seasonal_shop_closed_banner_web_leslienpc.png');
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 60px;
        }
      }
    }
  }
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import ItemRows from 'client/components/ui/itemRows';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import Avatar from 'client/components/avatar';

  import BuyModal from '../buyModal.vue';
  import bPopover from 'bootstrap-vue/lib/components/popover';
  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

  import svgPin from 'assets/svg/pin.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import featuredItems from 'common/script/content/shop-featuredItems';

  import _filter from 'lodash/filter';
  import _map from 'lodash/map';
  import _sortBy from 'lodash/sortBy';
  import _throttle from 'lodash/throttle';
  import _groupBy from 'lodash/groupBy';

  import _isPinned from '../_isPinned';

  export default {
    components: {
      ShopItem,
      Item,
      CountBadge,
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
          warrior: svgWarrior,
          wizard: svgWizard,
          rogue: svgRogue,
          healer: svgHealer,
        }),

        sortItemsBy: ['AZ', 'sortByNumber'],
        selectedSortItemsBy: 'AZ',

        selectedItemToBuy: null,

        hidePinned: false,
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        seasonal: 'shops.seasonal.data',
        user: 'user.data',
        userStats: 'user.data.stats',
      }),
      categories () {
        if (this.seasonal) {
          this.seasonal.categories.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
            });
          });

          return this.seasonal.categories;
        } else {
          return [];
        }
      },
      filterCategories () {
        if (this.content) {
          let equipmentList = _filter(_map(this.content.itemList, (i, key) => {
            return {
              ...i,
              key,
            };
          }), 'isEquipment');

          equipmentList.map((category) => {
            this.$set(this.viewOptions, category.key, {
              selected: true,
            });
          });

          return equipmentList;
        } else {
          return [];
        }
      },

      featuredSet () {
        return _filter(this.categories, (c) => {
          return c.identifier === featuredItems.seasonal;
        })[0];
      },
    },
    methods: {
      getClassName (classType) {
        if (classType === 'wizard') {
          return this.$t('mage');
        } else {
          return this.$t(classType);
        }
      },
      seasonalItems (category, sortBy, searchBy, viewOptions, hidePinned) {
        let result = _map(category.items, (e) => {
          return {
            ...e,
            pinned: _isPinned(this.user, e),
          };
        });

        result = _filter(result, (i) => {
          if (hidePinned && i.pinned) {
            return false;
          }

          if (viewOptions[i.type] && !viewOptions[i.type].selected) {
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
      getGroupedCategories (categories) {
        let spellCategory = _filter(categories, (c) => {
          return c.identifier === 'spells';
        })[0];

        let setCategories = _filter(categories, 'specialClass');

        let result = _groupBy(setCategories, 'specialClass');
        result.spells = [
          spellCategory,
        ];

        return result;
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
      togglePinned (item) {
        return this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path});
      },
      buyItem (item) {
        this.$store.dispatch('shops:purchase', {type: item.purchaseType, key: item.key});
      },
    },
    created () {
      this.$store.dispatch('shops:fetchSeasonal');
    },
  };
</script>
