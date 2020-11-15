<template>
  <b-modal
    id="drop-cap-reached"
    size="md"
    :hide-header="true"
    :hide-footer="hasSubscription"
  >
    <div class="text-center">
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          v-once
          class="svg-icon"
          v-html="icons.close"
        ></div>
      </div>
      <h1
        v-once
        class="header purple"
      >
        {{ $t('dropCapReached') }}
      </h1>
      <div class="max-items-wrapper d-flex align-items-center justify-content-center">
        <div
          class="svg-icon sparkles sparkles-rotate"
          v-html="icons.sparkles"
        ></div>
        <div class="max-items-module d-flex align-items-center justify-content-center flex-column">
          <h1 class="max-items">
            {{ maxItems }}
          </h1>
          <span
            v-once
            class="items-text"
          >{{ $t('items') }}</span>
        </div>
        <div
          class="svg-icon sparkles"
          v-html="icons.sparkles"
        ></div>
      </div>
      <p
        v-once
        class="mb-4"
      >
        {{ $t('dropCapExplanation') }}
      </p>
      <a
        v-once
        class="standard-link d-block mb-3"
        @click="toWiki()"
      >
        {{ $t('dropCapLearnMore') }}
      </a>
    </div>
    <div
      slot="modal-footer"
      class="footer"
    >
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
        class="subs-benefits mb-3"
      >
        {{ $t('dropCapSubs') }}
      </p>
      <button
        v-once
        class="btn btn-primary"
        @click="toLearnMore()"
      >
        {{ $t('learnMore') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #drop-cap-reached {
    .modal-body {
      padding: 0 1.5rem;
    }

    .modal-footer {
      background: $gray-700;
      border-top: none;
      padding: 0 1.5rem 2rem 1.5rem;
    }

    .modal-dialog {
      width: 20.625rem;
      font-size: 0.875rem;
      line-height: 1.71;
      text-align: center;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .modal-close {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 4px;
    right: 16px;
    top: 16px;
    cursor: pointer;
    .svg-icon {
      width: 12px;
      height: 12px;
    }
  }

  .subs-benefits {
    font-size: 0.75rem;
    line-height: 1.33;
    font-style: normal;
  }

  .purple {
    color: $purple-300;
  }

  .header {
    font-size: 1.25rem;
    line-height: 1.4;
    text-align: center;
    margin-top: 2rem;
  }

  .sparkles {
    width: 2.5rem;
    height: 4rem;

    &.sparkles-rotate {
      transform: rotate(180deg);
    }
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
import closeIcon from '@/assets/svg/close.svg';
import sparkles from '@/assets/svg/star-group.svg';
import * as Analytics from '@/libs/analytics';
import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
        sparkles,
      }),
      maxItems: null,
    };
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
    close () {
      this.$root.$emit('bv::hide::modal', 'drop-cap-reached');
    },
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

      this.close();
      this.$router.push('/user/settings/subscription');
    },
  },
};
</script>
