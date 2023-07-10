<template>
  <div id="subscription-form">
    <b-form-group class="mb-3 w-100 h-100">
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <b-form-radio
        v-for="block in subscriptionBlocksOrdered"
        v-if="block.target !== 'group' && block.canSubscribe === true"
        :key="block.key"
        v-model="subscription.key"
        :value="block.key"
        class="subscribe-option pt-2 pl-5 pb-3 mb-0"
        :class="{selected: subscription.key === block.key}"
        @click.native="updateSubscriptionData(block.key)"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <div
          v-if="userReceivingGift && userReceivingGift._id"
          class="subscription-text ml-2 mb-1"
          v-html="$t('giftSubscriptionRateText', {price: block.price, months: block.months})"
        >
        </div>
        <div
          v-else
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
    <div class="mx-4 mb-4 text-center">
      <small
        v-if="note"
        v-once
        class="font-italic"
      >
        {{ $t(note) }}
      </small>
    </div>
    <!-- payment buttons first is for gift subs and the second is for renewing subs -->
    <payments-buttons
      v-if="userReceivingGift && userReceivingGift._id"
      :disabled="!subscription.key"
      :stripe-fn="() => redirectToStripe({gift, uuid: userReceivingGift._id, receiverName})"
      :paypal-fn="() => openPaypalGift({
        gift: gift, giftedTo: userReceivingGift._id, receiverName,
      })"
      :amazon-data="{type: 'single', gift, giftedTo: userReceivingGift._id, receiverName}"
    />
    <payments-buttons
      v-else
      :disabled="!subscription.key"
      :stripe-fn="() => redirectToStripe({
        subscription: subscription.key,
        coupon: subscription.coupon,
      })"
      :paypal-fn="() => openPaypal({url: paypalPurchaseLink, type: 'subscription'})"
      :amazon-data="{
        type: 'subscription',
        subscription: subscription.key,
        coupon: subscription.coupon
      }"
    />
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #subscription-form {
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
      padding-left: 12px;
      padding-right: 12px;
      font-size: 12px;
      line-height: 1.33;
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

  small {
    color: $gray-100;
    display: inline-block;
    font-size: 12px ;
    font-weight: normal;
    line-height: 1.33;
  }

  .subscribe-option {
    background-color: $gray-700;

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-600;
    }
  }
</style>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import paymentsButtons from '@/components/payments/buttons/list';
import paymentsMixin from '../../mixins/payments';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';

export default {
  components: {
    paymentsButtons,
  },
  mixins: [
    paymentsMixin,
  ],
  props: {
    note: {
      type: String,
      default: null,
    },
    userReceivingGift: {
      type: Object,
      default () {},
    },
    receiverName: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      subscription: {
        key: 'basic_earned',
      },
      gift: {
        type: 'subscription',
        subscription: { key: 'basic_earned' },
      },
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
          return '<span class="subscription-bubble py-1 mr-1">Gem cap raised to 30</span><span class="subscription-bubble py-1">+1 Mystic Hourglass</span>';
        case 'basic_6mo':
          return '<span class="subscription-bubble py-1 mr-1">Gem cap raised to 35</span><span class="subscription-bubble py-1">+2 Mystic Hourglass</span>';
        case 'basic_12mo':
          return '<span class="discount-bubble py-1 mr-1">Save 20%</span><span class="subscription-bubble py-1 mr-1">Gem cap raised to 45</span><span class="subscription-bubble py-1">+4 Mystic Hourglass</span>';
        default:
          return '<span class="subscription-bubble py-1">Gem cap at 25</span>';
      }
    },
    updateSubscriptionData (key) {
      this.subscription.key = key;
      if (this.userReceivingGift._id) this.gift.subscription.key = key;
    },
  },
};
</script>
