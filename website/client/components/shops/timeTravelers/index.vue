<template lang="pug">
  .row.timeTravelers
    .standard-sidebar.d-none.d-sm-block(v-if="!closed")
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in categories",
            :key="category.identifier",
          )
            .custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.identifier].selected", :id="`category-${category.identifier}`")
              label.custom-control-label(v-once, :for="`category-${category.identifier}`") {{ category.text }}

        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hidePinned') }}
          toggle-switch.float-right(
            v-model="hidePinned",
          )
    .standard-page
      div.featuredItems
        .background(:class="{'background-closed': closed, 'background-open': !closed }")
          div.npc(:class="{'closed': closed }")
            div.featured-label
              span.rectangle
              span.text(v-once) {{ $t('timeTravelers') }}
              span.rectangle
          div.content(v-if="closed")
            div.featured-label.with-border.closed
              span.rectangle
              span.text(v-once) {{ $t('timeTravelersPopoverNoSubMobile') }}
              span.rectangle

      .clearfix(v-if="!closed")
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
        v-if="!anyFilterSelected  || (!closed && viewOptions[category.identifier].selected)",
        :class="category.identifier"
      )
        h2.mb-3 {{ category.text }}

        itemRows(
          :items="travelersItems(category, selectedSortItemsBy, searchTextThrottled, hidePinned)",
          :itemWidth=94,
          :itemMargin=24,
          :type="category.identifier",
        )
          template(slot="item", slot-scope="ctx")
            shopItem(
              :key="ctx.item.key",
              :item="ctx.item",
              :price="ctx.item.value",
              :priceType="ctx.item.currency",
              :emptyItem="false",
              @click="selectItemToBuy(ctx.item)"
            )
              span(slot="popoverContent", slot-scope="ctx")
                div
                  h4.popover-content-title {{ ctx.item.text }}

              template(slot="itemBadge", slot-scope="ctx")
                span.badge.badge-pill.badge-item.badge-svg(
                  v-if="ctx.item.pinType !== 'IGNORE'",
                  :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                  @click.prevent.stop="togglePinned(ctx.item)"
                )
                  span.svg-icon.inline.icon-12.color(v-html="icons.pin")
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/variables.scss';

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

    .avatar {
      cursor: default;
      margin: 0 auto;
    }

    .featuredItems {
      height: 216px;

      .background {
        background-repeat: repeat-x;

        width: 100%;
        position: absolute;

        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .background-open {
        background: url('~assets/images/npc/#{$npc_timetravelers_flavor}/time_travelers_background.png');
        height: 188px;
      }
      .background-closed {
        background: url('~assets/images/npc/normal/time_travelers_background.png');
        height: 216px;
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
        background: url('~assets/images/npc/#{$npc_timetravelers_flavor}/time_travelers_open_banner.png');
        background-repeat: no-repeat;

        &.closed {
          background: url('~assets/images/npc/normal/time_travelers_closed_banner.png');
          background-repeat: no-repeat;
        }

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

  import svgPin from 'assets/svg/pin.svg';
  import svgHourglass from 'assets/svg/hourglass.svg';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _throttle from 'lodash/throttle';
  import _groupBy from 'lodash/groupBy';
  import _map from 'lodash/map';

  import isPinned from 'common/script/libs/isPinned';
  import shops from 'common/script/libs/shops';

  import pinUtils from 'client/mixins/pinUtils';

  export default {
    mixins: [pinUtils],
    components: {
      ShopItem,
      Item,
      CountBadge,
      ItemRows,
      toggleSwitch,

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

        hidePinned: false,

        backgroundUpdate: new Date(),
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        quests: 'shops.quests.data',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),

      closed () {
        return this.user.purchased.plan.consecutive.trinkets === 0;
      },

      shop () {
        return shops.getTimeTravelersShop(this.user);
      },

      categories () {
        let apiCategories = this.shop.categories;

        // FIX ME Refactor the apiCategories Hack to force update for now until we restructure the data
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

        let normalGroups = _filter(apiCategories, (c) => {
          return c.identifier === 'mounts' || c.identifier === 'pets';
        });

        let setGroups = _filter(apiCategories, (c) => {
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
              purchaseType: 'mystery_set',
            };
          }),
        };

        normalGroups.push(setCategory);

        normalGroups.map((category) => {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
          });
        });

        return normalGroups;
      },
      anyFilterSelected () {
        return Object.values(this.viewOptions).some(g => g.selected);
      },
    },
    methods: {
      travelersItems (category, sortBy, searchBy, hidePinned) {
        let result = _map(category.items, (e) => {
          return {
            ...e,
            pinned: isPinned(this.user, e),
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
      selectItemToBuy (item) {
        this.$root.$emit('buyModal::showItem', item);
      },
    },
    created () {
      this.$root.$on('buyModal::boughtItem', () => {
        this.backgroundUpdate = new Date();
      });
    },
    beforeDestroy () {
      this.$root.$off('buyModal::boughtItem');
    },
  };
</script>
