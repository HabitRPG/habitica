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
      <span slot="popoverContent">
        <strong v-if="item.key === 'gem' && gemsLeft === 0">{{ $t('maxBuyGems') }}</strong>
        <h4 class="popover-content-title">{{ item.text }}</h4>
        <div
          v-if="item.event"
          class="mt-2"
        >
          {{ limitedString }}
        </div>
      </span>
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
import moment from 'moment';
import { mapState } from '@/libs/store';
import pinUtils from '@/mixins/pinUtils';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import seasonalShopConfig from '@/../../common/script/libs/shops-seasonal.config';

import ShopItem from '../shopItem';
import CategoryItem from './categoryItem';

export default {
  components: {
    CategoryItem,
    ShopItem,
  },
  mixins: [pinUtils],
  props: ['hideLocked', 'hidePinned', 'searchBy', 'sortBy', 'category'],
  data () {
    return {
      timer: '',
      limitedString: '',
    };
  },
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
  mounted () {
    this.countdownString();
    this.timer = setInterval(this.countdownString, 1000);
  },
  methods: {
    itemSelected (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
    countdownString () {
      const diffDuration = moment.duration(moment(seasonalShopConfig.dateRange.end).diff(moment()));

      if (diffDuration.asSeconds() <= 0) {
        this.limitedString = this.$t('noLongerAvailable');
      } else if (diffDuration.days() > 0 || diffDuration.months() > 0) {
        this.limitedString = this.$t('limitedAvailabilityDays', {
          days: moment(seasonalShopConfig.dateRange.end).diff(moment(), 'days'),
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else if (diffDuration.asMinutes() > 2) {
        this.limitedString = this.$t('limitedAvailabilityHours', {
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else {
        this.limitedString = this.$t('limitedAvailabilityMinutes', {
          minutes: diffDuration.minutes(),
          seconds: diffDuration.seconds(),
        });
      }
    },
    cancelAutoUpdate () {
      clearInterval(this.timer);
    },
  },
  beforeDestroy () {
    this.cancelAutoUpdate();
  },
};
</script>
