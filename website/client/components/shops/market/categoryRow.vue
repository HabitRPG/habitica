<template lang="pug">
div.items
  shopItem(
    v-for="item in sortedMarketItems",
    :key="item.key",
    :item="item",
    :emptyItem="false",
    :popoverPosition="'top'",
    @click="itemSelected(item)"
  )
    span(slot="popoverContent")
      strong(v-if='item.key === "gem" && gemsLeft === 0') {{ $t('maxBuyGems') }}
      h4.popover-content-title {{ item.text }}
    template(slot="itemBadge", slot-scope="ctx")
      countBadge(
        v-if="item.showCount !== false",
        :show="true",
        :count="getCount(ctx.item)"
      )
      .badge.badge-pill.badge-purple.gems-left(v-if='item.key === "gem"')
        | {{ gemsLeft }}
      span.badge.badge-pill.badge-item.badge-svg(
        :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
        @click.prevent.stop="togglePinned(ctx.item)"
      )
        span.svg-icon.inline.icon-12.color(v-html="icons.pin")
</template>

<script>
  import {mapState} from 'client/libs/store';
  import planGemLimits from 'common/script/libs/planGemLimits';
  import ShopItem from '../shopItem';
  import CountBadge from 'client/components/ui/countBadge';

  import pinUtils from 'client/mixins/pinUtils';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _map from 'lodash/map';

  import svgPin from 'assets/svg/pin.svg';
  export default {
    mixins: [pinUtils],
    props: ['hideLocked', 'hidePinned', 'searchBy', 'sortBy', 'category'],
    components: {
      ShopItem,
      CountBadge,
    },
    data () {
      return {
        icons: Object.freeze({
          pin: svgPin,
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
      gemsLeft () {
        if (!this.user.purchased.plan) return 0;
        return planGemLimits.convCap + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
      },
      sortedMarketItems () {
        let result = _map(this.category.items, (e) => {
          return {
            ...e,
            pinned: this.isPinned(e),
          };
        });

        result = _filter(result, (item) => {
          if (this.hidePinned && item.pinned) {
            return false;
          }

          if (this.searchBy) {
            let foundPosition = item.text.toLowerCase().indexOf(this.searchBy);
            if (foundPosition === -1) {
              return false;
            }
          }

          return true;
        });

        switch (this.sortBy) {
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
      getCount (item) {
        console.info('getCount', item.key);
        return this.userItems[item.purchaseType][item.key] || 0;
      },
    },
  };
</script>

<style scoped>

</style>
