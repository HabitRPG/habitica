<template>
  <div id="subscription-form">
    <div
      class="w-100 h-100"
      :class="{'mb-2': userReceivingGift?._id}"
    >
      <strong
        v-if="userReceivingGift?._id"
        class="text-center d-block mb-3 mx-5"
      >
        {{ $t('giftSubscriptionLeadText') }}
      </strong>
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
          'mx-4': userReceivingGift?._id,
        }"
        @click="updateSubscriptionData(block.key)"
      >
        <div v-if="subscription.key === block.key">
          <div class="selected-corner"></div>
          <div
            class="svg svg-icon svg-check color m-2"
            v-html="icons.check"
          >
          </div>
        </div>
        <div
          v-if="block.months === 12"
          class="ribbon mt-3 d-flex align-items-center"
        >
          <small class="bold teal-1"> {{ $t('popular') }} </small>
        </div>
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <div class="w-100">
          <div
            class="mx-5"
            v-if="block.months < 12"
          >
            <h2
              class="mt-3 mb-1"
            > ${{ block.price }}.00 USD </h2>
            <small
              class="bold mb-2"
            >
              {{ recurrenceText(block.months) }}
            </small>
            <div class="d-flex flex-column mb-3">
              <div class="d-flex align-items-center mb-1">
                <div
                  class="svg svg-icon svg-plus color mr-1"
                  v-html="icons.plus"
                >
                </div>
                <small
                  v-html="userReceivingGift?._id ? $t('unlockNGemsGift', { count: 24 })
                    : $t('unlockNGems', { count: 24 })"
                ></small>
              </div>
              <div class="d-flex align-items-center">
                <div
                  class="svg svg-icon svg-plus color mr-1"
                  v-html="icons.plus"
                >
                </div>
                <small
                  v-html="userReceivingGift?._id ? $t('earn2GemsGift') : $t('earn2Gems')"
                ></small>
              </div>
            </div>
          </div>
          <div v-else>
            <div
              class="bg-white py-3 pl-5"
              :class="{ round: userReceivingGift?._id }"
            >
              <div class="d-flex align-items-center mb-1">
                <h2 class="mr-2 my-auto"> ${{ block.price }}.00 USD</h2>
                <strike class="gray-200">$60.00 USD</strike>
              </div>
              <small class="bold mb-2">
                {{ recurrenceText(block.months) }}
              </small>
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center mb-1">
                  <div
                    class="svg svg-icon svg-plus color mr-1"
                    v-html="icons.plus"
                  >
                  </div>
                  <small
                    v-html="userReceivingGift?._id ? $t('unlockNGemsGift', { count: 50 })
                      : $t('unlockNGems', { count: 50 })"
                  ></small>
                </div>
                <div class="d-flex align-items-center">
                  <div
                    class="svg svg-icon svg-plus color mr-1"
                    v-html="icons.plus"
                  >
                  </div>
                  <small v-html="userReceivingGift?._id ? $t('maxGemCapGift') : $t('maxGemCap')">
                  </small>
                </div>
              </div>
            </div>
            <div
              class="gradient-banner text-center"
              v-if="!userReceivingGift?._id && !user?.purchased?.plan?.hourglassPromoReceived"
            >
              <small class="my-3" v-html="$t('immediate12Hourglasses')"></small>
            </div>
          </div>
        </div>
      </div>
      <button
        class="btn btn-primary"
        :class="[canceled ? 'mt-4' : 'mt-3', userReceivingGift?._id ? 'mx-4' : 'w-100']"
        @click="$root.$emit('bv::show::modal', 'buy-subscription')"
      > {{ userReceivingGift?._id ? $t('selectPayment') : $t('subscribe') }} </button>
    </div>
    <div
      v-if="note"
      class="mx-4 my-3 text-center"
    >
      <small
        v-once
        class="font-italic"
      >
        {{ $t(note) }}
      </small>
    </div>
    <b-modal
      id="buy-subscription"
      size="md"
      :hide-header="true"
      :hide-footer="true"
    >
      <payments-buttons
        v-if="userReceivingGift?._id"
        :disabled="!subscription.key"
        :stripe-fn="() => redirectToStripe({
          gift,
          uuid: userReceivingGift._id,
          receiverName,
          g1g1: userReceivingGift.g1g1,
        })"
        :paypal-fn="() => openPaypalGift({
          gift: gift,
          giftedTo: userReceivingGift._id,
          receiverName,
          g1g1: userReceivingGift.g1g1,
        })"
      />
      <payments-buttons
        v-else
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

    .selected strong {
      color: $yellow-5;
    }

    .selected .gradient-banner strong {
      color: $teal-1;
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

  strike, strong {
    line-height: 24px;
  }

  .btn-primary {
    min-width: 400px;
  }

  .gradient-banner small {
    color: $teal-1;
    width: 61%;
  }

  .ribbon {
    width: fit-content;
    background: linear-gradient(90deg, rgba(119, 244, 199, 1), rgba(114, 207, 255, 1));
    border-radius: 4px;
    clip-path: polygon(0px 0px, calc(100% + 1px) 0px, calc(100% + 1px) calc(100% + 1px),
      0px calc(100% + 3px), 4px 50%);
    box-shadow: 0px 1px 3px 0px rgba(26, 24, 29, 0.12), 0px 1px 2px 0px rgba(26, 24, 29, 0.24);
    position: absolute;
    right: -4px;
    line-height: 1.33;
    padding: 4px 10px 4px 12px;
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
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba($black, 0.12), 0px 1px 2px 0px rgba($black, 0.24);
    position: relative;
    background-color: $white;

    .bg-white {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;

      &.round {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    }

    &.final h2 {
      color: $teal-10;
    }

    &:hover, &.selected {
      box-shadow: 0px 3px 6px 0px rgba($black, 0.16), 0px 3px 6px 0px rgba($black, 0.24);
    }

    &.selected {
      &.final {
        small {
          color: $teal-1;
        }
      }
      &:not(.final) {
        h2, small {
          color: $purple-200;
        }
      }
      .svg-plus {
        color: $yellow-10;
      }
    }

    &.final {
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
    position: absolute;
    color: $white;
  }

  .svg-plus {
    color: $gray-300;
    min-width: 10px;
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
        subscription: { key: 'basic_12mo' },
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
    recurrenceText (months) {
      if (this.userReceivingGift?._id) {
        if (months < 2) {
          return this.$t('oneMonthGift');
        }
        return this.$t('nMonthsGift', { months });
      }
      if (months < 2) {
        return this.$t('recurringMonthly');
      }
      return (this.$t('recurringNMonthly', { length: months }));
    },
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
