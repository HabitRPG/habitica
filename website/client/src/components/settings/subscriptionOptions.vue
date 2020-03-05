<template>
  <div id="subscription-form">
    <b-form-group class="mb-4 w-100 h-100">
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <b-form-radio
        v-for="block in subscriptionBlocksOrdered"
        v-if="block.target !== 'group' && block.canSubscribe === true"
        :key="block.key"
        v-model="subscription.key"
        :value="block.key"
        class="subscribe-option pt-2 pl-5 pb-3 mb-0"
        :class="{selected: subscription.key === block.key}"
        @click.native="subscription.key = block.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <div
          class="subscription-text ml-2 mb-1"
          v-html="$t('subscriptionRateText', {price: block.price, months: block.months})"
        >
        </div>
        <div
          class="ml-2"
          v-html="subscriptionBubbles(block.key)"
        >
        </div>
      </b-form-radio>
    </b-form-group>
    <div class="payments-column mx-auto mt-auto">
      <button
        class="purchase btn btn-primary payment-button payment-item"
        :class="{disabled: !subscription.key}"
        :disabled="!subscription.key"
        @click="showStripe({subscription:subscription.key, coupon:subscription.coupon})"
      >
        <div
          v-once
          class="svg-icon credit-card-icon"
          v-html="icons.creditCardIcon"
        ></div>
        {{ $t('card') }}
      </button>
      <button
        class="btn payment-item paypal-checkout payment-button"
        :class="{disabled: !subscription.key}"
        :disabled="!subscription.key"
        @click="openPaypal(paypalPurchaseLink, 'subscription')"
      >
        &nbsp;
        <img
          src="~@/assets/images/paypal-checkout.png"
          :alt="$t('paypal')"
        >&nbsp;
      </button>
      <amazon-button
        class="payment-item"
        :class="{disabled: !subscription.key}"
        :disabled="!subscription.key"
        :amazon-data="{
          type: 'subscription',
          subscription: subscription.key,
          coupon: subscription.coupon
        }"
      />
    </div>
  </div>
</template>


<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  #subscription-form {
    .disabled .amazonpay-button-inner-image {
      cursor: default !important;
    }

    .custom-control .custom-control-label::before,
    .custom-radio .custom-control-input:checked ~ .custom-control-label::after {
      margin-top: 0.75rem;
    }

    .selected {
      background-color: rgba(213, 200, 255, 0.32);

      .subscription-bubble {
        background-color: $purple-300;
        color: $white;
      }
      .subscription-text {
        color: $purple-200;
      }
    }

    .subscription-bubble, .discount-bubble {
      border-radius: 100px;
      font-size: 12px;
    }

    .subscription-bubble {
      background-color: $gray-600;
      color: $gray-200;
    }

    .discount-bubble {
      background-color: $green-10;
      color: $white;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .disabled {
    opacity: 0.64;

    .btn, .btn:hover, .btn:active {
      box-shadow: none;
      cursor: default !important;
    }
  }

  .subscribe-option {
    border-bottom: 1px solid $gray-600;
  }
</style>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import amazonButton from '@/components/payments/amazonButton';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import paymentsMixin from '../../mixins/payments';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';

export default {
  components: {
    amazonButton,
  },
  mixins: [
    paymentsMixin,
  ],
  data () {
    return {
      subscription: {
        key: null,
      },
      icons: Object.freeze({
        creditCardIcon,
      }),
    };
  },
  computed: {
    subscriptionBlocks () {
      return subscriptionBlocks;
    },
    subscriptionBlocksOrdered () {
      const subscriptions = filter(subscriptionBlocks, o => o.discount !== true);

      return sortBy(subscriptions, [o => o.months]);
    },
  },
  methods: {
    subscriptionBubbles (subscription) {
      switch (subscription) {
        case 'basic_3mo':
          return '<span class="subscription-bubble px-2 py-1 mr-1">Gem cap raised to 30</span><span class="subscription-bubble px-2 py-1">+1 Mystic Hourglass</span>';
        case 'basic_6mo':
          return '<span class="subscription-bubble px-2 py-1 mr-1">Gem cap raised to 35</span><span class="subscription-bubble px-2 py-1">+2 Mystic Hourglass</span>';
        case 'basic_12mo':
          return '<span class="discount-bubble px-2 py-1 mr-1">Save 20%</span><span class="subscription-bubble px-2 py-1 mr-1">Gem cap raised to 45</span><span class="subscription-bubble px-2 py-1">+4 Mystic Hourglass</span>';
        default:
          return '<span class="subscription-bubble px-2 py-1">Gem cap at 25</span>';
      }
    },
  },
};
</script>
