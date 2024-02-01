<template>
  <div class="row customizations">
    <div
      class="standard-sidebar d-none d-sm-block">
      <filter-sidebar>
        <div
          slot="search"
          class="form-group"
        >
          <input
            v-model="searchText"
            class="form-control input-search"
            type="text"
            :placeholder="$t('search')"
          >
        </div>
        <filter-group>
          <checkbox
            v-for="category in categories"
            :id="`category-${category.identifier}`"
            :key="category.identifier"
            :checked.sync="viewOptions[category.identifier].selected"
            :text="category.text"
          />
        </filter-group>
        <div class="form-group clearfix">
          <h3
            v-once
            class="float-left"
          >
            {{ $t('hidePinned') }}
          </h3>
          <toggle-switch
            v-model="hidePinned"
            class="float-right"
          />
        </div>
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="featuredItems">
        <div
          class="background"
          :style="{'background-image': imageURLs.background}"
        >
          <div
            class="npc"
            :style="{'background-image': imageURLs.npc}"
          >
            <div class="featured-label">
              <span class="rectangle"></span><span
                v-once
                class="text"
              >Beffy</span><span class="rectangle"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="clearfix">
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <select-translated-array
            :right="true"
            :value="selectedSortItemsBy"
            :items="sortItemsBy"
            :inline-dropdown="false"
            class="inline"
            @select="selectedSortItemsBy = $event"
          />
        </div>
      </div>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="category in categories"
        v-if="!anyFilterSelected || viewOptions[category.identifier].selected"
        :key="category.identifier"
        :class="category.identifier"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h2 class="mb-3">
          {{ category.text }}
        </h2>
        <itemRows
          v-if="category.identifier === 'backgrounds'"
          :items="customizationItems(category, selectedSortItemsBy,
            searchTextThrottled, hidePinned)"
          :item-width="94"
          :item-margin="24"
          :type="category.identifier"
        >
          <template
            slot="item"
            slot-scope="ctx"
          >
            <shopItem
              :key="ctx.item.key"
              :item="ctx.item"
              :price="ctx.item.value"
              :price-type="ctx.item.currency"
              :empty-item="false"
              @click="selectItemToBuy(ctx.item)"
            >
              <span
                v-if="ctx.item.text != ''"
                slot="popoverContent"
                slot-scope="ctx"
              ><div><h4 class="popover-content-title">{{ ctx.item.text }}</h4></div></span>>
              <template
                slot="itemBadge"
                slot-scope="ctx"
              >
                <span
                  v-if="ctx.item.pinType !== 'IGNORE'"
                  class="badge-top"
                  @click.prevent.stop="togglePinned(ctx.item)"
                >
                  <pin-badge
                    :pinned="ctx.item.pinned"
                  />
                </span>
              </template>
            </shopItem>
          </template>
        </itemRows>
        <div v-else
            v-for="items in getGrouped(customizationItems(category, selectedSortItemsBy,
              searchTextThrottled, hidePinned))"
              v-bind:key="items[0].set.key"
              class="mb-5">
              <h3>{{ items[0].set.text() }}</h3>
          <itemRows
          :items="items"
          :item-width="94"
          :item-margin="24"
          :type="category.identifier">
          <template
            slot="item"
            slot-scope="ctx"
          >
            <shopItem
              :key="ctx.item.path"
              :item="ctx.item"
              :price="ctx.item.value"
              :price-type="ctx.item.currency"
              :empty-item="false"
              @click="selectItemToBuy(ctx.item)"
            >
              <span
                v-if="ctx.item.text != ''"
                slot="popoverContent"
                slot-scope="ctx"
              ><div><h4 class="popover-content-title">{{ ctx.item.text }}</h4></div></span>>
              <template
                slot="itemBadge"
                slot-scope="ctx"
              >
                <span
                  v-if="ctx.item.pinType !== 'IGNORE'"
                  class="badge-top"
                  @click.prevent.stop="togglePinned(ctx.item)"
                >
                  <pin-badge
                    :pinned="ctx.item.pinned"
                  />
                </span>
              </template>
            </shopItem>
          </template>
        </itemRows>
        <div
          v-if="items[0].set"
          :style="'width: ' + (items.length * (94 + 24) - 24) + 'px'"
          class="purchase-set"
          @click="unlock()"
        >
          <div class="purchase-set-content mx-auto">
            <span class="label">{{ $t('purchaseAll') }}</span>
            <div
              class="svg-icon gem"
              v-html="icons.gem"
            ></div>
            <span class="price">{{ items[0].set.setPrice  }}</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable max-len -->
<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  // these styles may be applied to other pages too

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

  .customizations {
    .standard-page {
      position: relative;
    }

    .badge-pin:not(.pinned) {
        display: none;
      }

    .item:hover .badge-pin {
      display: block;
    }

    .avatar {
      cursor: default;
      margin: 0 auto;
    }

    .featuredItems {
      height: 216px;

      .background {
        height: 216px;
        background-repeat: repeat-x;

        width: 100%;
        position: absolute;

        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

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
}
.purchase-set {
    background: #fff;
    padding: 0.5em;
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    margin-top: -28px;
    width: 180px;
    display: block;
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

    span {
      font-size: 14px;
    }

    .gem, .coin {
      width: 20px;
      margin: 0 .5em;
      display: inline-block;
      vertical-align: bottom;
    }
  }

.purchase-set-content {
  display: block;
  width: 150px;
}
</style>
<!-- eslint-enable max-len -->

<script>
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _throttle from 'lodash/throttle';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import _find from 'lodash/find';
import isPinned from '@/../../common/script/libs/isPinned';
import shops from '@/../../common/script/libs/shops';
import { mapState } from '@/libs/store';

import ShopItem from '../shopItem';
import ItemRows from '@/components/ui/itemRows';
import PinBadge from '@/components/ui/pinBadge';
import toggleSwitch from '@/components/ui/toggleSwitch';

import svgHourglass from '@/assets/svg/hourglass.svg';
import gem from '@/assets/svg/gem.svg';

import pinUtils from '@/mixins/pinUtils';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';
import Checkbox from '@/components/ui/checkbox';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';

export default {
  components: {
    SelectTranslatedArray,
    Checkbox,
    FilterGroup,
    FilterSidebar,
    ShopItem,
    ItemRows,
    PinBadge,
    toggleSwitch,
  },
  mixins: [pinUtils],
  data () {
    return {
      viewOptions: {},

      searchText: null,
      searchTextThrottled: null,

      icons: Object.freeze({
        hourglass: svgHourglass,
        gem,
      }),

      sortItemsBy: ['AZ', 'sortByNumber'],
      selectedSortItemsBy: 'AZ',

      selectedItemToBuy: null,

      hidePinned: false,

      backgroundUpdate: new Date(),

      currentEvent: null,
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userStats: 'user.data.stats',
      userItems: 'user.data.items',
      currentEventList: 'worldState.data.currentEventList',
    }),

    shop () {
      return shops.getCustomizationShop(this.user);
    },

    categories () {
      const { categories } = this.shop;

      categories.forEach(category => {
        // do not reset the viewOptions if already set once
        if (typeof this.viewOptions[category.identifier] === 'undefined') {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
          });
        }
      });

      return categories;
    },
    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
    imageURLs () {
      if (!this.currentEvent || !this.currentEvent.season || this.currentEvent.season === 'thanksgiving') {
        return {
          background: 'url(/static/npc/normal/market_background.png)',
          npc: 'url(/static/npc/normal/market_banner_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${this.currentEvent.season}/market_background.png)`,
        npc: `url(/static/npc/${this.currentEvent.season}/market_banner_npc.png)`,
      };
    },
  },
  watch: {
    searchText: _throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('titleCustomizations'),
      section: this.$t('shops'),
    });
    this.$root.$on('buyModal::boughtItem', () => {
      this.backgroundUpdate = new Date();
    });
    this.$root.$on('bv::modal::hidden', event => {
      if (event.componentId === 'buy-quest-modal') {
        this.$root.$emit('buyModal::hidden', this.selectedItemToBuy.key);
      }
    });
    this.currentEvent = _find(this.currentEventList, event => Boolean(['winter', 'spring', 'summer', 'fall'].includes(event.season)));
  },
  beforeDestroy () {
    this.$root.$off('buyModal::boughtItem');
  },
  methods: {
    customizationItems (category, sortBy, searchBy, hidePinned) {
      let result = _map(category.items, e => ({
        ...e,
        pinned: isPinned(this.user, e),
      }));

      result = _filter(result, i => {
        if (hidePinned && i.pinned) {
          return false;
        }

        return !searchBy || i.text.toLowerCase().indexOf(searchBy) !== -1;
      });

      switch (sortBy) { // eslint-disable-line default-case
        case 'AZ': {
          result = _sortBy(result, ['set.key', 'text']);

          break;
        }
        case 'sortByNumber': {
          result = _sortBy(result, ['set.key', 'value']);

          break;
        }
      }

      return result;
    },
    getGrouped (entries) {
      return _groupBy(entries, 'set.key');
    },
    selectItemToBuy (item) {
      if (item.purchaseType === 'quests') {
        this.selectedItemToBuy = item;

        this.$root.$emit('bv::show::modal', 'buy-quest-modal');
      } else {
        this.$root.$emit('buyModal::showItem', item);
      }
    },
    resetItemToBuy ($event) {
      if (!$event) {
        this.selectedItemToBuy = null;
      }
    },
  },
};
</script>
