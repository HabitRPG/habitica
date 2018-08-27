<template lang="pug">
div
  countBadge(
    v-if="item.showCount !== false",
    :show="true",
    :count="count"
  )
  .badge.badge-pill.badge-purple.gems-left(v-if='item.key === "gem"')
    | {{ gemsLeft }}
  span.badge.badge-pill.badge-item.badge-svg(
    :class="{'item-selected-badge': item.pinned, 'hide': !item.pinned}",
    @click.prevent.stop="togglePinned(item)"
  )
    span.svg-icon.inline.icon-12.color(v-html="icons.pin")
</template>

<script>
import { mapState } from 'client/libs/store';
import CountBadge from 'client/components/ui/countBadge';

import svgPin from 'assets/svg/pin.svg';
import planGemLimits from 'common/script/libs/planGemLimits';
import pinUtils from '../../../mixins/pinUtils';

export default {
  mixins: [pinUtils],
  props: ['item'],
  components: {
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
      user: 'user.data',
      userItems: 'user.data.items',
    }),
    count () {
      return this.userItems[this.item.purchaseType][this.item.key];
    },
    gemsLeft () {
      if (!this.user.purchased.plan) return 0;
      return planGemLimits.convCap + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
    },
  },
};
</script>
