<template lang="pug">
  .row.timeTravelers
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
              span.text(v-once) {{ timeTravelers.text }}
              span.rectangle
          div.content(v-if="false")
            div.featured-label.with-border
              span.rectangle
              span.text(v-once) {{ $t('featuredQuests') }}
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
                @click="selectedItemToBuy = item"
              )
                template(slot="popoverContent", scope="ctx")
                  div
                    h4.popover-content-title {{ item.text() }}
                    .popover-content-text {{ item.notes() }}

      h1.mb-0.page-header(v-once) {{ timeTravelers.text }}

      .clearfix
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
        v-if="viewOptions[category.identifier].selected",
        :class="category.identifier"
      )
        h2 {{ category.text }}

        itemRows(
          :items="travelersItems(category, selectedSortItemsBy, searchTextThrottled, hidePinned)",
          :itemWidth=94,
          :itemMargin=24,
        )
          template(slot="item", scope="ctx")
            shopItem(
              :key="ctx.item.key",
              :item="ctx.item",
              :price="ctx.item.value",
              :priceType="ctx.item.currency",
              :itemContentClass="getItemClass(ctx.item)",
              :emptyItem="false",
              @click="selectedItemToBuy = ctx.item"
            )
              span(slot="popoverContent", scope="ctx")
                div
                  h4.popover-content-title {{ ctx.item.text }}

              template(slot="itemBadge", scope="ctx")
                span.badge.badge-pill.badge-item.badge-svg(
                  v-if="ctx.item.pinType !== 'IGNORE'",
                  :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                  @click.prevent.stop="togglePinned(ctx.item)"
                )
                  span.svg-icon.inline.icon-12.color(v-html="icons.pin")

    buyModal(
      :item="selectedItemToBuy",
      :priceType="selectedItemToBuy ? selectedItemToBuy.currency : ''",
      :withPin="true",
      @change="resetItemToBuy($event)",
      @buyPressed="buyItem($event)"
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
    width: 33%;
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

  .timeTravelers {
    .standard-page {
      position: relative;
    }

    .mounts {
      .shop-content .image div {
        position: absolute;
        top: 0;
        left: 7px;
        right: 0;
        z-index: 0;
      }
    }

    .featuredItems {
      height: 216px;

      .background {
        background: url('~assets/images/shops/shop_background.png');

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
        top: 0;
        width: 100%;
        height: 216px;
        background: url('~assets/images/shops/time_travelers_open_banner_web_tylerandvickynpcs.png');
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 40px;
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
  import svgHourglass from 'assets/svg/hourglass.svg';

  import featuredItems from 'common/script/content/shop-featuredItems';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _throttle from 'lodash/throttle';
  import _groupBy from 'lodash/groupBy';
  import _map from 'lodash/map';

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
          hourglass: svgHourglass,
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
        quests: 'shops.quests.data',
        timeTravelers: 'shops.time-travelers.data',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),
      categories () {
        if (this.timeTravelers) {
          let normalGroups = _filter(this.timeTravelers.categories, (c) => {
            return c.identifier === 'mounts' || c.identifier === 'pets';
          });

          let setGroups = _filter(this.timeTravelers.categories, (c) => {
            return c.identifier !== 'mounts' && c.identifier !== 'pets';
          });

          let setCategory = {
            identifier: 'sets',
            text: this.$t('mysterySets'),
            items: setGroups.map((c) => {
              return {
                ...c,
                value: 1,
                currency: 'hourglasses',
                key: c.identifier,
                class: `shop_set_mystery_${c.identifier}`,
              };
            }),
          };

          normalGroups.push(setCategory);

          normalGroups.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
            });
          });

          return normalGroups;
        } else {
          return [];
        }
      },

      featuredItems () {
        return featuredItems.quests.map(i => {
          return this.content.quests[i];
        });
      },
    },
    methods: {
      travelersItems (category, sortBy, searchBy, hidePinned) {
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
      getGrouped (entries) {
        return _groupBy(entries, 'group');
      },
      resetItemToBuy ($event) {
        if (!$event) {
          this.selectedItemToBuy = null;
        }
      },
      togglePinned (item) {
        if (!this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path})) {
          this.$parent.showUnpinNotification(item);
        }
      },
      buyItem (item) {
        this.$store.dispatch('shops:purchase', {type: item.purchaseType, key: item.key});
      },
      getItemClass (item) {
        return `shop_${item.type}_${item.key}`;
      },
    },
    created () {
      this.$store.dispatch('shops:fetchTimeTravelers');
    },
  };
</script>
