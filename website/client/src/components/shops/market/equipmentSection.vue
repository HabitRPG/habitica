<template>
  <layout-section :title="$t('equipment')">
    <div slot="filters">
      <filter-dropdown
        :label="$t('class')"
        :initial-item="selectedGearCategory"
        :items="marketGearCategories"
        :with-icon="true"
        @selected="selectedGroupGearByClass = $event.id"
      >
        <span
          slot="item"
          slot-scope="ctx"
        >
          <span
            class="svg-icon inline icon-16"
            v-html="icons[ctx.item.id]"
          ></span>
          <span class="text">{{ getClassName(ctx.item.id) }}</span>
        </span>
      </filter-dropdown>
      <filter-dropdown
        :label="$t('sortBy')"
        :initial-item="selectedSortGearBy"
        :items="sortGearBy"
        @selected="selectedSortGearBy = $event"
      >
        <span
          slot="item"
          slot-scope="ctx"
        >
          <span class="text">{{ $t(ctx.item.id) }}</span>
        </span>
      </filter-dropdown>
    </div>
    <itemRows
      slot="content"
      class="equipment-rows"
      :items="sortedGearItems"
      :item-width="94"
      :item-margin="24"
      :type="'gear'"
      :no-items-label="$t('noGearItemsOfClass')"
    >
      <template
        slot="item"
        slot-scope="ctx"
      >
        <shopItem
          :key="ctx.item.key"
          :item="ctx.item"
          :popover-position="'top'"
          @click="gearSelected(ctx.item)"
        >
          <template
            slot="itemBadge"
            slot-scope="ctx"
          >
            <span
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
  </layout-section>
</template>

<script>
import _filter from 'lodash/filter';
import _orderBy from 'lodash/orderBy';
import { mapState } from '@/libs/store';
import LayoutSection from '@/components/ui/layoutSection';
import FilterDropdown from '@/components/ui/filterDropdown';
import ItemRows from '@/components/ui/itemRows';
import PinBadge from '@/components/ui/pinBadge';
import ShopItem from '../shopItem';

import shops from '@/../../common/script/libs/shops';

import svgWarrior from '@/assets/svg/warrior.svg';
import svgWizard from '@/assets/svg/wizard.svg';
import svgRogue from '@/assets/svg/rogue.svg';
import svgHealer from '@/assets/svg/healer.svg';

import pinUtils from '../../../mixins/pinUtils';
import { getClassName } from '../../../../../common/script/libs/getClassName';

const sortGearTypes = [
  'sortByType', 'sortByPrice', 'sortByCon',
  'sortByPer', 'sortByStr', 'sortByInt',
].map(g => ({ id: g }));

const sortGearTypeMap = {
  sortByType: 'type',
  sortByPrice: 'value',
  sortByCon: 'con',
  sortByPer: 'per',
  sortByStr: 'str',
  sortByInt: 'int',
};

export default {
  components: {
    LayoutSection,
    FilterDropdown,
    ItemRows,
    PinBadge,
    ShopItem,
  },
  mixins: [pinUtils],
  props: ['hideLocked', 'hidePinned', 'searchBy'],
  data () {
    return {
      sortGearBy: sortGearTypes,
      selectedSortGearBy: sortGearTypes[0],
      selectedGroupGearByClass: '',
      icons: Object.freeze({
        warrior: svgWarrior,
        wizard: svgWizard,
        rogue: svgRogue,
        healer: svgHealer,
      }),
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userItems: 'user.data.items',
      userStats: 'user.data.stats',
    }),
    marketGearCategories () {
      return shops.getMarketGearCategories(this.user).map(c => {
        c.id = c.identifier;

        return c;
      });
    },
    selectedGearCategory () {
      return this.marketGearCategories.filter(c => c.id === this.selectedGroupGearByClass)[0];
    },
    sortedGearItems () {
      const result = this.filterGearItems();
      const selectedSortKey = sortGearTypeMap[this.selectedSortGearBy.id];
      const sortingByStat = selectedSortKey !== 'type' && selectedSortKey !== 'value';
      const order = sortingByStat ? 'desc' : 'asc';

      // split into unlocked and locked, then apply selected sort
      return _orderBy(result, ['locked', selectedSortKey], ['asc', order]);
    },
  },
  created () {
    this.selectedGroupGearByClass = this.userStats.class;
  },
  methods: {
    getClassName (classType) {
      return this.$t(getClassName(classType));
    },
    gearSelected (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
    filterGearItems () {
      const category = _filter(this.marketGearCategories, ['identifier', this.selectedGroupGearByClass]);
      const { items } = category[0];

      return _filter(items, gear => {
        if (this.hideLocked && gear.locked) {
          return false;
        }
        if (this.hidePinned && gear.pinned) {
          return false;
        }

        if (this.searchBy) {
          const foundPosition = gear.text.toLowerCase().indexOf(this.searchBy);
          if (foundPosition === -1) {
            return false;
          }
        }

        // hide already owned
        return !this.userItems.gear.owned[gear.key];
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .badge-pin:not(.pinned) {
      display: none;
    }

  .item:hover .badge-pin {
    display: block;
  }
</style>
