<template>
  <div>
    <countBadge
      v-if="item.showCount !== false"
      :show="true"
      :count="count"
    />
    <div
      v-if="item.key === 'gem'"
      class="badge badge-pill badge-purple gems-left"
    >
      {{ gemsLeft }}
    </div>
    <span
      class="badge-top"
      @click.prevent.stop="togglePinned(item)"
    >
      <pin-badge
        :pinned="item.pinned"
      />
    </span>
  </div>
</template>

<style lang="scss" scoped>
  .badge-pin:not(.pinned) {
      display: none;
    }

  .item:hover .badge-pin {
    display: block;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import CountBadge from '@/components/ui/countBadge';

import PinBadge from '@/components/ui/pinBadge';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import pinUtils from '../../../mixins/pinUtils';

export default {
  components: {
    CountBadge,
    PinBadge,
  },
  mixins: [pinUtils],
  props: ['item'],
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
      return planGemLimits.convCap
        + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
    },
  },
};
</script>
