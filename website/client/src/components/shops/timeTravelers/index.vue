<template>
  <div class="row timeTravelers">
    <div
      v-if="!closed"
      class="standard-sidebar d-none d-sm-block"
    >
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
          :class="{'background-closed': closed, 'background-open': !closed }"
          :style="{'background-image': imageURLs.background}"
        >
          <div
            class="npc"
            :class="{'closed': closed }"
            :style="{'background-image': imageURLs.npc}"
          >
            <div class="featured-label">
              <span class="rectangle"></span><span
                v-once
                class="text"
              >{{ $t('timeTravelers') }}</span><span class="rectangle"></span>
            </div>
          </div><div
            v-if="closed"
            class="content"
          >
            <div class="featured-label with-border closed">
              <span class="rectangle"></span><span
                v-once
                class="text"
              >{{ $t('timeTravelersPopoverNoSubMobile') }}</span><span class="rectangle"></span>
            </div>
          </div>
        </div>
      </div><div
        v-if="!closed"
        class="clearfix"
      >
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
        v-if="!anyFilterSelected || (!closed && viewOptions[category.identifier].selected)"
        :key="category.identifier"
        :class="category.identifier"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h2 class="mb-3">
          {{ category.text }}
        </h2><itemRows
          :items="travelersItems(category, selectedSortItemsBy, searchTextThrottled, hidePinned)"
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
                v-if="category !== 'quests'"
                slot="popoverContent"
                slot-scope="ctx"
              ><div><h4 class="popover-content-title">{{ ctx.item.text }}</h4></div></span>
              <span
                v-if="category === 'quests'"
                slot="popoverContent"
              ><div class="questPopover">
                <h4 class="popover-content-title">{{ item.text }}</h4>
                <questInfo :quest="item" />
              </div></span>
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
      </div>
    </div><buyQuestModal
      :item="selectedItemToBuy || {}"
      :price-type="selectedItemToBuy ? selectedItemToBuy.currency : ''"
      :with-pin="true"
      @change="resetItemToBuy($event)"
    >
      <template
        slot="item"
        slot-scope="ctx"
      >
        <item
          class="flat"
          :item="ctx.item"
          :item-content-class="ctx.item.class"
          :show-popover="false"
        />
      </template>
    </buyQuestModal>
  </div>
</template>

<!-- eslint-disable max-len -->
<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  // these styles may be applied to other pages too

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
        height: 188px;
      }
      .background-closed {
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
        background-repeat: no-repeat;

        &.closed {
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
<!-- eslint-enable max-len -->

<script>
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _throttle from 'lodash/throttle';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import { mapState } from '@/libs/store';

import ShopItem from '../shopItem';
import Item from '@/components/inventory/item';
import ItemRows from '@/components/ui/itemRows';
import QuestInfo from '../quests/questInfo.vue';
import PinBadge from '@/components/ui/pinBadge';
import toggleSwitch from '@/components/ui/toggleSwitch';

import BuyQuestModal from '../quests/buyQuestModal.vue';

import svgHourglass from '@/assets/svg/hourglass.svg';

import isPinned from '@/../../common/script/libs/isPinned';
import shops from '@/../../common/script/libs/shops';

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
    Item,
    ItemRows,
    PinBadge,
    toggleSwitch,
    QuestInfo,

    BuyQuestModal,
  },
  mixins: [pinUtils],
  data () {
    return {
      viewOptions: {},

      searchText: null,
      searchTextThrottled: null,

      icons: Object.freeze({
        hourglass: svgHourglass,
      }),

      sortItemsBy: ['AZ', 'sortByNumber'],
      selectedSortItemsBy: 'AZ',

      selectedItemToBuy: null,

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
      currentEvent: 'worldState.data.currentEvent',
    }),

    closed () {
      return this.user.purchased.plan.consecutive.trinkets === 0;
    },

    shop () {
      return shops.getTimeTravelersShop(this.user);
    },

    categories () {
      const apiCategories = this.shop.categories;

      // FIX ME Refactor the apiCategories Hack to
      // force update for now until we restructure the data
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      const normalGroups = _filter(apiCategories, c => c.identifier === 'mounts' || c.identifier === 'pets' || c.identifier === 'quests' || c.identifier === 'backgrounds');

      const setGroups = _filter(apiCategories, c => c.identifier !== 'mounts' && c.identifier !== 'pets' && c.identifier !== 'quests' && c.identifier !== 'backgrounds');

      const setCategory = {
        identifier: 'sets',
        text: this.$t('mysterySets'),
        items: setGroups.map(c => ({
          ...c,
          value: 1,
          currency: 'hourglasses',
          key: c.identifier,
          class: `shop_set_mystery_${c.identifier}`,
          purchaseType: 'mystery_set',
        })),
      };

      normalGroups.push(setCategory);

      normalGroups.forEach(category => {
        // do not reset the viewOptions if already set once
        if (typeof this.viewOptions[category.identifier] === 'undefined') {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
          });
        }
      });

      return normalGroups;
    },
    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
    imageURLs () {
      if (!this.currentEvent || !this.currentEvent.season || this.currentEvent.season === 'thanksgiving') {
        return {
          background: 'url(/static/npc/normal/time_travelers_background.png)',
          npc: this.closed ? 'url(/static/npc/normal/time_travelers_closed_banner.png)'
            : 'url(/static/npc/normal/time_travelers_open_banner.png)',
        };
      }
      return {
        background: `url(/static/npc/${this.currentEvent.season}/time_travelers_background.png)`,
        npc: `url(/static/npc/${this.currentEvent.season}/time_travelers_open_banner.png)`,
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
      subSection: this.$t('timeTravelers'),
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
  },
  beforeDestroy () {
    this.$root.$off('buyModal::boughtItem');
  },
  methods: {
    travelersItems (category, sortBy, searchBy, hidePinned) {
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
