<template>
  <div class="items">
    <shopItem
      v-for="item in sortedMarketItems"
      :key="item.key"
      :item="item"
      :empty-item="false"
      :popover-position="'top'"
      @click="itemSelected(item)"
    >
      <template
        slot="itemBadge"
        slot-scope="ctx"
      >
        <category-item :item="ctx.item" />
      </template>
    </shopItem>
  </div>
</template>

<script>
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _map from 'lodash/map';
import { mapState } from '@/libs/store';
import pinUtils from '@/mixins/pinUtils';
import planGemLimits from '@/../../common/script/libs/planGemLimits';

import ShopItem from '../shopItem';
import CategoryItem from './categoryItem';

export default {
  components: {
    CategoryItem,
    ShopItem,
  },
  mixins: [pinUtils],
  props: ['hideLocked', 'hidePinned', 'searchBy', 'sortBy', 'category'],
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userItems: 'user.data.items',
      userStats: 'user.data.stats',
    }),
    gemsLeft () {
      if (!this.user.purchased.plan) return 0;
      return planGemLimits.convCap
        + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
    },
    sortedMarketItems () {
      let result = _map(this.category.items, e => ({
        ...e,
        pinned: this.isPinned(e),
      }));

      result = _filter(result, item => {
        if (this.hidePinned && item.pinned) {
          return false;
        }

        if (this.searchBy) {
          const foundPosition = item.text.toLowerCase().indexOf(this.searchBy);
          if (foundPosition === -1) {
            return false;
          }
        }

        return true;
      });

      switch (this.sortBy) { // eslint-disable-line default-case
        case 'AZ': {
          result = _sortBy(result, ['text']);

          break;
        }
        case 'sortByNumber': {
          result = _sortBy(result, item => {
            if (item.showCount === false) return 0;

            return this.userItems[item.purchaseType][item.key] || 0;
          });
          break;
        }
      }

      return result;
    },
  },
  methods: {
    itemSelected (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
  },
};
</script>
