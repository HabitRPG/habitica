<template>
  <page-layout class="market">
    <div slot="sidebar">
      <div class="form-group">
        <input
          v-model="searchText"
          class="form-control input-search"
          type="text"
          :placeholder="$t('search')"
        >
      </div>
      <market-filter
        :hide-locked.sync="hideLocked"
        :hide-pinned.sync="hidePinned"
        :view-options="viewOptions"
      />
    </div>
    <div slot="page">
      <featured-items-header
        :broken="broken"
        :npc-name="'Alex'"
        :featured-text="market.featured.text"
        :featured-items="market.featured.items"
        @featuredItemSelected="featuredItemSelected($event)"
      />
      <h1
        v-once
        class="mb-4 page-header"
      >
        {{ $t('market') }}
      </h1>
      <equipment-section
        v-if="!anyFilterSelected || viewOptions['equipment'].selected"
        :hide-pinned="hidePinned"
        :hide-locked="hideLocked"
        :search-by="searchTextThrottled"
      />
      <layout-section :title="$t('items')">
        <div slot="filters">
          <filter-dropdown
            :label="$t('sortBy')"
            :initial-item="selectedSortItemsBy"
            :items="sortItemsBy"
            @selected="selectedSortItemsBy = $event"
          >
            <span
              slot="item"
              slot-scope="ctx"
            >
              <span class="text">{{ $t(ctx.item.id) }}</span>
            </span>
          </filter-dropdown>
        </div>
      </layout-section>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="category in categories"
        v-if="!anyFilterSelected || viewOptions[category.identifier].selected"
        :key="category.identifier"
      >
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <h4>{{ category.text }}</h4>
        <category-row
          :hide-pinned="hidePinned"
          :hide-locked="hideLocked"
          :search-by="searchTextThrottled"
          :sort-by="selectedSortItemsBy.id"
          :category="category"
        />
        <keys-to-kennel v-if="category.identifier === 'special'" />
        <div class="fill-height"></div>
      </div>
      <inventoryDrawer
        :show-eggs="true"
        :show-potions="true"
      >
        <template
          slot="item"
          slot-scope="ctx"
        >
          <item
            :item="ctx.item"
            :item-content-class="ctx.itemClass"
            popover-position="top"
            @click="sellItem(ctx)"
          >
            <countBadge
              slot="itemBadge"
              :show="true"
              :count="ctx.itemCount"
            />
            <h4
              slot="popoverContent"
              class="popover-content-title"
            >
              {{ ctx.itemName }}
            </h4>
          </item>
        </template>
      </inventoryDrawer>
      <sellModal />
    </div>
  </page-layout>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  .fill-height {
    height: 38px; // button + margin + padding
  }


  .icon-48 {
    width: 48px;
    height: 48px;
  }

  .item-wrapper.bordered-item .item {
    width: 112px;
    height: 112px;
  }

  .market {
    .avatar {
      cursor: default;
      margin: 0 auto;
    }


    .featuredItems {
      .background {
        background: url('~@/assets/images/npc/#{$npc_market_flavor}/market_background.png');

        background-repeat: repeat-x;
      }

      .npc {
        background: url('~@/assets/images/npc/#{$npc_market_flavor}/market_banner_npc.png');
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 80px;
        }
      }
    }
  }

  .market .gems-left {
    right: -.5em;
    top: -.5em;
  }
</style>


<script>
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _throttle from 'lodash/throttle';
import { mapState } from '@/libs/store';

import KeysToKennel from './keysToKennel';
import EquipmentSection from './equipmentSection';
import CategoryRow from './categoryRow';
import Item from '@/components/inventory/item';
import CountBadge from '@/components/ui/countBadge';
import InventoryDrawer from '@/components/shared/inventoryDrawer';
import FeaturedItemsHeader from '../featuredItemsHeader';
import PageLayout from '@/components/ui/pageLayout';
import LayoutSection from '@/components/ui/layoutSection';
import FilterDropdown from '@/components/ui/filterDropdown';
import MarketFilter from './filter';

import SellModal from './sellModal.vue';

import svgPin from '@/assets/svg/pin.svg';
import svgGem from '@/assets/svg/gem.svg';
import svgInformation from '@/assets/svg/information.svg';

import getItemInfo from '@/../../common/script/libs/getItemInfo';
import shops from '@/../../common/script/libs/shops';


import notifications from '@/mixins/notifications';
import buyMixin from '@/mixins/buy';
import currencyMixin from '../_currencyMixin';
import inventoryUtils from '@/mixins/inventoryUtils';
import pinUtils from '@/mixins/pinUtils';

const sortItems = ['AZ', 'sortByNumber'].map(g => ({ id: g }));

export default {
  components: {
    KeysToKennel,
    Item,
    CountBadge,

    SellModal,

    InventoryDrawer,
    FeaturedItemsHeader,
    PageLayout,
    LayoutSection,
    FilterDropdown,
    EquipmentSection,
    CategoryRow,
    MarketFilter,
  },
  mixins: [notifications, buyMixin, currencyMixin, inventoryUtils, pinUtils],
  data () {
    return {
      viewOptions: {
        equipment: {
          selected: false,
          text: this.$t('equipment'),
        },
      },

      searchText: null,
      searchTextThrottled: null,

      icons: Object.freeze({
        pin: svgPin,
        gem: svgGem,
        information: svgInformation,
      }),

      sortItemsBy: sortItems,
      selectedSortItemsBy: sortItems[0],

      hideLocked: false,
      hidePinned: false,

      broken: false,
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userStats: 'user.data.stats',
      userItems: 'user.data.items',
    }),
    market () {
      return shops.getMarketShop(this.user);
    },
    categories () {
      if (!this.market) return [];

      const categories = [
        ...this.market.categories,
      ];

      categories.push({
        identifier: 'cards',
        text: this.$t('cards'),
        items: _map(_filter(this.content.cardTypes, value => value.yearRound), value => ({
          ...getItemInfo(this.user, 'card', value),
          showCount: false,
        })),
      });

      const specialItems = [{
        ...getItemInfo(this.user, 'fortify'),
        showCount: false,
      }];

      if (this.user.purchased.plan.customerId) {
        const gemItem = getItemInfo(this.user, 'gem');

        specialItems.push({
          ...gemItem,
          showCount: false,
        });
      }

      if (this.user.flags.rebirthEnabled) {
        const rebirthItem = getItemInfo(this.user, 'rebirth_orb');

        specialItems.push({
          showCount: false,
          ...rebirthItem,
        });
      }

      if (specialItems.length > 0) {
        categories.push({
          identifier: 'special',
          text: this.$t('special'),
          items: specialItems,
        });
      }

      categories.forEach(category => {
        if (!this.viewOptions[category.identifier]) {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
            text: category.text,
          });
        }
      });

      return categories;
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
  async mounted () {
    const worldState = await this.$store.dispatch('worldState:getWorldState');
    this.broken = worldState && worldState.worldBoss
      && worldState.worldBoss.extra && worldState.worldBoss.extra.worldDmg
      && worldState.worldBoss.extra.worldDmg.market;
  },
  methods: {
    sellItem (itemScope) {
      this.$root.$emit('sellItem', itemScope);
    },
    ownedItems (type) {
      const mappedItems = _filter(this.content[type], i => this.userItems[type][i.key] > 0);

      switch (type) {
        case 'food':
          return _filter(mappedItems, f => f.key !== 'Saddle');
        case 'special':
          if (this.userItems.food.Saddle) {
            return _filter(this.content.food, f => f.key === 'Saddle');
          }
          return [];

        default:
          return mappedItems;
      }
    },
    hasOwnedItemsForType (type) {
      return this.ownedItems(type).length > 0;
    },
    inventoryDrawerErrorMessage (type) {
      if (!this.hasOwnedItemsForType(type)) {
        // @TODO: Change any places using similar locales
        // from `pets.json` and use these new locales from 'inventory.json'
        return this.$t('noItemsAvailableForType', { type: this.$t(`${type}ItemType`) });
      }

      return null;
    },
    itemSelected (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
    featuredItemSelected (item) {
      if (item.purchaseType === 'gear') {
        if (!item.locked) {
          this.itemSelected(item);
        }
      } else {
        this.itemSelected(item);
      }
    },
  },
};
</script>
