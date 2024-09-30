<template>
  <div id="subscription-form">
    <div class="w-100 h-100">
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="block in subscriptionBlocksOrdered"
        v-if="block.target !== 'group' && block.canSubscribe === true"
        :key="block.key"
        :value="block.key"
        class="subscribe-option d-flex"
        :class="{
          selected: subscription.key === block.key,
          'mb-2': block.months !== 12,
          final: block.months === 12,
        }"
        @click="updateSubscriptionData(block.key)"
      >
        <div
          v-if="subscription.key === block.key"
          class="selected-corner"
        >
        </div>
        <div
          class="svg svg-icon svg-check color m-2"
          v-html="icons.check"
        >
        </div>
        <div
          v-if="block.months === 12"
          class="ribbon mt-3 d-flex align-items-center"
        >
          <small class="bold teal-1"> {{ $t('popular') }} </small>
        </div>
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <div
          v-if="userReceivingGift && userReceivingGift._id"
          class="subscription-text ml-2 mb-1"
          v-html="$t('giftSubscriptionRateText', {price: block.price, months: block.months})"
        >
        </div>
        <div v-else class="w-100">
          <div
            class="ml-5"
            v-if="block.months < 12"
          >
            <h2
              class="mt-3 mb-1"
              :class="{ 'purple-200': subscription.key === block.key }"
            > ${{ block.price }}.00 USD </h2>
            <small
              v-if="block.months < 2"
              class="bold mb-2"
              :class="{ 'purple-200': subscription.key === block.key }"
            >
              {{ $t('recurringMonthly') }}
            </small>
            <small
              v-else
              class="bold mb-2"
              :class="{ 'purple-200': subscription.key === block.key }"
            >
              {{ $t('recurringNMonthly', { length: block.months }) }}
            </small>
            <div class="d-flex flex-column">
              <div class="d-flex align-items-center mb-1">
                <div
                  class="svg svg-icon svg-plus color mr-1"
                  :class="{
                    'yellow-10': subscription.key === block.key,
                    'gray-300': subscription.key !== block.key,
                  }"
                  v-html="icons.plus"
                >
                </div>
                <div
                  class="small"
                  :class="{ 'purple-200': subscription.key === block.key }"
                  v-html="$t('unlockNGems', { count: 24 })">
                </div>
              </div>
              <div class="d-flex align-items-center">
                <div
                  class="svg svg-icon svg-plus color mr-1"
                  :class="{
                    'yellow-10': subscription.key === block.key,
                    'gray-300': subscription.key !== block.key,
                  }"
                  v-html="icons.plus"
                >
                </div>
                <div
                  class="small"
                  :class="{ 'purple-200': subscription.key === block.key }"
                  v-html="$t('earn2Gems')">
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="bg-white py-3 pl-5">
              <div class="d-flex align-items-center mb-1">
                <h2 class="teal-10 mr-2 my-auto"> ${{ block.price }}.00 USD </h2>
                <strike class="gray-200">$60.00 USD</strike>
              </div>
              <small class="bold teal-1 mb-2">
                {{ $t('recurringNMonthly', { length: block.months }) }}
              </small>
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center mb-1">
                  <div
                    class="svg svg-icon svg-plus yellow-10 color mr-1"
                    v-html="icons.plus"
                  >
                  </div>
                  <div class="small teal-1" v-html="$t('unlockNGems', { count: 50 })"></div>
                </div>
                <div class="d-flex align-items-center">
                  <div
                    class="svg svg-icon svg-plus yellow-10 color mr-1"
                    v-html="icons.plus"
                  >
                  </div>
                  <div class="small teal-1" v-html="$t('maxGemCap')"></div>
                </div>
              </div>
            </div>
            <div
              class="gradient-banner text-center"
            >
              <small class="mt-3" v-html="$t('immediate12Hourglasses')"></small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="note"
      class="mx-4 mb-4 text-center"
    >
      <small
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
    <button
      v-else
      class="btn btn-primary w-100"
      :class="canceled ? 'mt-4' : 'mt-3'"
      @click="$root.$emit('bv::show::modal', 'buy-subscription')"
    > {{ $t('subscribe') }} </button>
    <b-modal
      id="buy-subscription"
      size="md"
      :hide-header="true"
      :hide-footer="true"
    >
      <payments-buttons
        :disabled="!subscription.key"
        :stripe-fn="() => redirectToStripe({
          subscription: subscription.key,
          coupon: subscription.coupon,
        })"
        :paypal-fn="() => openPaypal({url: paypalPurchaseLink, type: 'subscription'})"
      />
    </b-modal>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #subscription-form {
    .custom-control .custom-control-label::before,
    .custom-radio .custom-control-input:checked ~ .custom-control-label::after {
      margin-top: 0.75rem;
    }

    .discount-bubble {
      background-color: $green-10;
      color: $white;
    }

    .selected {
      outline: 2px solid $purple-300;
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

    .teal-1 strong, .purple-200 strong {
      color: $yellow-5 !important;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  small, .small {
    color: $gray-100;
    display: inline-block;
    font-size: 12px ;
    font-weight: normal;
    line-height: 16px;

    &.bold {
      font-weight: 700;
    }
  }

  strike {
    line-height: 24px;
  }

  .gradient-banner small {
    color: $teal-1;
    width: 61%;
  }

  .ribbon {
    height: 24px;
    width: fit-content;
    background: linear-gradient(90deg, rgba(119, 244, 199, 1), rgba(114, 207, 255, 1));
    border-radius: 4px;
    clip-path: polygon(0px 0px, calc(100% + 1px) 0px, calc(100% + 1px) calc(100% + 1px),
      0px calc(100% + 3px), 4px 50%);
    box-shadow: 0px 1px 3px 0px rgba(26, 24, 29, 0.12), 0px 1px 2px 0px rgba(26, 24, 29, 0.24);
    position: absolute;
    right: -4px;
    padding-left: 12px;
    padding-right: 10px;
  }

  .selected-corner {
    border-color: $purple-300 transparent transparent transparent;
    border-style: solid;
    border-width: 48px 48px 0 0;
    border-top-left-radius: 4px;
    position: absolute;
  }

  .subscribe-option {
    max-width: 448px;
    height: 120px;
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba($black, 0.12), 0px 1px 2px 0px rgba($black, 0.24);
    position: relative;

    &:hover {
      box-shadow: 0px 3px 6px 0px rgba($black, 0.16), 0px 3px 6px 0px rgba($black, 0.24);
    }

    &.final {
      height: 184px;
      background: linear-gradient(90deg, rgba($green-500, 1), rgba(114, 207, 255, 1));
    }

    h2 {
      font-family: 'Roboto', sans-serif;
      line-height: 24px;
      color: $gray-50;
    }
  }

  .svg-check {
    width: 16px;
    height: 16px;
    position: absolute;
    color: $white;
  }

  .svg-plus {
    width: 10px;
    height: 10px;
  }
</style>

<script>
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import paymentsButtons from '@/components/payments/buttons/list';
import paymentsMixin from '../../mixins/payments';
import check from '@/assets/svg/check.svg';
import plus from '@/assets/svg/positive.svg';

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
    canceled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      gift: {
        type: 'subscription',
        subscription: { key: 'basic_earned' },
      },
      icons: Object.freeze({
        check,
        plus,
      }),
      subscription: {
        key: 'basic_12mo',
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
      if (this.userReceivingGift?._id) this.gift.subscription.key = key;
    },
  },
};
</script>
