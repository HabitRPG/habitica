<template>
  <div class="row timeTravelers">
    <div
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
      </div>
      <div class="d-flex justify-content-between w-items">
        <h1
          v-once
          class="page-header mt-4 mb-4"
        >
          {{ $t('timeTravelers') }}
        </h1>
        <div
          class="clearfix mt-4"
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
        </h2><itemRows
          :items="travelersItems(category, selectedSortItemsBy, searchTextThrottled, hidePinned)"
          :item-width="94"
          :item-margin="24"
          :type="category.identifier"
          :fold-button="false"
          :no-items-label="$t('allEquipmentOwned')"
          :click-handler="false"
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
            />
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

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/shops.scss';

  .w-items {
    max-width: 920px;
  }
</style>

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
import Item from '@/components/inventory/item';
import ItemRows from '@/components/ui/itemRows';
import toggleSwitch from '@/components/ui/toggleSwitch';

import BuyQuestModal from '../quests/buyQuestModal.vue';

import svgHourglass from '@/assets/svg/hourglass.svg';

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
    toggleSwitch,

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

      currentEvent: null,

      imageURLs: {
        background: '',
        npc: '',
      },
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      quests: 'shops.quests.data',
      user: 'user.data',
      userStats: 'user.data.stats',
      userItems: 'user.data.items',
      currentEventList: 'worldState.data.currentEventList',
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
    this.currentEvent = _find(this.currentEventList, event => Boolean(['winter', 'spring', 'summer', 'fall'].includes(event.season)));
    if (!this.currentEvent || !this.currentEvent.season || this.currentEvent.season === 'thanksgiving' || this.closed) {
      this.imageURLs.background = 'url(/static/npc/normal/time_travelers_background.png)';
      this.imageURLs.npc = this.closed ? 'url(/static/npc/normal/time_travelers_closed_banner.png)'
        : 'url(/static/npc/normal/time_travelers_open_banner.png)';
    } else {
      this.imageURLs.background = `url(/static/npc/${this.currentEvent.season}/time_travelers_background.png)`;
      this.imageURLs.npc = `url(/static/npc/${this.currentEvent.season}/time_travelers_open_banner.png)`;
    }
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
