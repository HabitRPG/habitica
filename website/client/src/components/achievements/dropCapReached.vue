<template>
  <small-modal
    id="drop-cap-reached"
    :title="$t('dropCapReached')"
    button-text-key="learnMore"
    @buttonClicked="toLearnMore"
    :hide-footer="hasSubscription"
  >
    <starred>
      <div class="max-items-module d-flex align-items-center justify-content-center flex-column">
        <h1 class="max-items">
          {{ maxItems }}
        </h1>
        <span
          v-once
          class="items-text"
        >{{ $t('items') }}</span>
      </div>
    </starred>
    <p v-once class="text-center m-3">
      {{ $t('dropCapExplanation') }}
    </p>
    <a
      v-once
      class="standard-link d-block mb-3 text-center"
      @click="toWiki"
    >
      {{ $t('dropCapLearnMore') }}
    </a>

    <template #greyed>
      <div class="text-center">
        <span
          v-once
          class="purple d-block font-weight-bold mb-3 mt-3"
        >
          {{ $t('lookingForMoreItems') }}
        </span>
        <img
          class="swords mb-3"
          srcset="
        ~@/assets/images/swords.png,
        ~@/assets/images/swords@2x.png 2x,
        ~@/assets/images/swords@3x.png 3x"
          src="~@/assets/images/swords.png"
        >
        <p
          v-once
          class="subs-benefits mb-0"
        >
          {{ $t('dropCapSubs') }}
        </p>
      </div>
    </template>
  </small-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .subs-benefits {
    font-size: 0.75rem;
    line-height: 1.33;
    font-style: normal;
  }

  .purple {
    color: $purple-300;
  }

  .max-items-wrapper {
    margin: 17px auto;
  }

  .max-items-module {
    background: white;
    border-radius: 92px;
    border: 8px solid $purple-400;
    width: 92px;
    height: 92px;
    margin-left: 17px;
    margin-right: 17px;

    .items-text {
      font-size: 0.75rem;
      line-height: 1.33;
      color: $gray-100;
    }
  }

  .max-items {
    font-size: 2rem;
    line-height: 1.25;
    color: $purple-300;
    margin: 0;
  }

  .swords {
    width: 7rem;
    height: 3rem;
  }
</style>

<script>
import smallModal from '@/components/ui/modal/smallModal';
import starred from '@/components/ui/modal/starred.vue';

import * as Analytics from '@/libs/analytics';
import { mapState } from '@/libs/store';

export default {
  components: {
    smallModal,
    starred,
  },
  data () {
    return { maxItems: null };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    hasSubscription () {
      return Boolean(this.user.purchased.plan.customerId);
    },
  },
  mounted () {
    this.$root.$on('habitica:drop-cap-reached', notification => {
      this.maxItems = notification.data.items;
      this.$root.$emit('bv::show::modal', 'drop-cap-reached');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:drop-cap-reached');
  },
  methods: {
    toWiki () {
      window.open('https://habitica.fandom.com/wiki/Drops', '_blank');

      Analytics.track({
        hitType: 'event',
        eventCategory: 'drop-cap-reached',
        eventAction: 'click',
        eventLabel: 'Drop Cap Reached > Modal > Wiki',
      });
    },
    toLearnMore () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'drop-cap-reached',
        eventAction: 'click',
        eventLabel: 'Drop Cap Reached > Modal > Subscriptions',
      });

      this.$root.$emit('bv::hide::modal', 'drop-cap-reached');
      this.$router.push('/user/settings/subscription');
    },
  },
};
</script>
