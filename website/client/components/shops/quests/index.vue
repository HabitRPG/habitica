<template lang="pug">
  .row.quests
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
                    .popover-content-text(v-html="item.notes()")

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
        h2 {{ category.text }}

        itemRows(
          v-if="category.identifier === 'pet'",
          :items="questItems(category, selectedSortItemsBy, searchTextThrottled, hideLocked, hidePinned)",
          :itemWidth=94,
          :itemMargin=24,
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
                  .popover-content-text(v-html="ctx.item.notes")

              template(slot="itemBadge", scope="ctx")
                span.badge.badge-pill.badge-item.badge-svg(
                  :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                  @click.prevent.stop="togglePinned(ctx.item)"
                )
                  span.svg-icon.inline.icon-12.color(v-html="icons.pin")

                countBadge(
                  :show="userItems.quests[ctx.item.key] > 0",
                  :count="userItems.quests[ctx.item.key] || 0"
                )

        div.grouped-parent(v-else-if="category.identifier === 'unlockable' || category.identifier === 'gold'")
          div.group(v-for="(items, key) in getGrouped(questItems(category, selectedSortItemsBy, searchTextThrottled, hideLocked, hidePinned))")
            h3 {{ $t(key) }}
            div.items
              shopItem(
                v-for="item in items",
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
                    .popover-content-text(v-html="item.notes")

                template(slot="itemBadge", scope="ctx")
                  span.badge.badge-pill.badge-item.badge-svg(
                    :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                    @click.prevent.stop="togglePinned(ctx.item)"
                  )
                    span.svg-icon.inline.icon-12.color(v-html="icons.pin")

                  countBadge(
                    :show="userItems.quests[ctx.item.key] > 0",
                    :count="userItems.quests[ctx.item.key] || 0"
                  )

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
                .popover-content-text(v-html="item.notes")

            template(slot="itemBadge", scope="ctx")
              span.badge.badge-pill.badge-item.badge-svg(
                :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                @click.prevent.stop="togglePinned(ctx.item)"
              )
                span.svg-icon.inline.icon-12.color(v-html="icons.pin")

              countBadge(
                :show="userItems.quests[ctx.item.key] > 0",
                :count="userItems.quests[ctx.item.key] || 0"
              )

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

  .quests {
    .standard-page {
      position: relative;
    }
    .featuredItems {
      height: 216px;

      .background {
        background: url('~assets/images/shops/quest_shop_banner_background.png');

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

  import BuyModal from './buyQuestModal.vue';
  import bPopover from 'bootstrap-vue/lib/components/popover';
  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

  import svgPin from 'assets/svg/pin.svg';

  import featuredItems from 'common/script/content/shop-featuredItems';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _throttle from 'lodash/throttle';
  import _groupBy from 'lodash/groupBy';

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
        }),

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
      getGrouped (entries) {
        return _groupBy(entries, 'group');
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
        let isPinned = Boolean(item.pinned);
        item.pinned = !isPinned;
        this.$store.dispatch(isPinned ? 'shops:unpinGear' : 'shops:pinGear', {key: item.key});
      },
      buyItem (item) {
        this.$store.dispatch('shops:purchase', {type: item.purchaseType, key: item.key});
      },
    },
    created () {
      this.$store.dispatch('shops:fetchQuests');
    },
  };
</script>
