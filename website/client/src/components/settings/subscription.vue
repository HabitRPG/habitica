<template>
  <div class="standard-page pt-0 px-0">
    <div class="banner-g1g1 mx-n3 d-flex justify-content-center">
      <div
        class="svg-icon svg-gifts gifts-left my-auto mr-5 ml-auto"
        v-html="icons.giftsVertical">
      </div>
      <div class="my-auto text-center">
        <strong> {{ $t('g1g1Announcement') }} </strong>
        <div class="mt-1"> {{ $t('g1g1Details') }} </div>
      </div>
      <div
        class="svg-icon svg-gifts gifts-right my-auto ml-5 mr-auto"
        v-html="icons.giftsVertical">
      </div>
    </div>
    <div class="row mt-3">
      <div class="block-header mx-auto">
        {{ $t('support') }}
      </div>
    </div>
    <div class="row mb-5">
      <div
        class="svg-icon svg-logo mx-auto mt-1"
        v-html="icons.logo"
      ></div>
    </div>
    <div class="d-flex justify-content-center">
      <div>
        <div class="row col-12 ml-1">
          <h2> {{ $t('subscribersReceiveBenefits') }} </h2>
        </div>
        <div class="row">
          <div class="col-2">
            <div
              class="svg-icon svg-gems ml-3 mt-1"
              v-html="icons.subscriberGems"
            ></div>
          </div>
          <div class="col-10">
            <h3> {{ $t('buyGemsGold') }} </h3>
            <p> {{ $t('subscriptionBenefit1') }} </p>
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <div
              class="svg-icon svg-hourglasses ml-3 mt-1"
              v-html="icons.subscriberHourglasses"
            ></div>
          </div>
          <div class="col-10">
            <h3> {{ $t('mysticHourglassesTooltip') }} </h3>
            <p> {{ $t('subscriptionBenefit6') }} </p>
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <div
              :class="currentMysterySet"
              class="mt-n1"
            ></div>
          </div>
          <div class="col-10">
            <h3> {{ $t('monthlyMysteryItems') }} </h3>
            <p> {{ $t('subscriptionBenefit4') }} </p>
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <div class="Pet-Jackalope-RoyalPurple"></div>
          </div>
          <div class="col-10">
            <h3> {{ $t('exclusiveJackalopePet') }} </h3>
            <p> {{ $t('subscriptionBenefit5') }} </p>
          </div>
        </div>
        <div class="row">
          <div class="col-2">
            <div class="image-foods ml-2 mt-2"></div>
          </div>
          <div class="col-10">
            <h3> {{ $t('doubleDropCap') }} </h3>
            <p> {{ $t('subscriptionBenefit3') }} </p>
          </div>
        </div>
      </div>
      <div class="flex-spacer"></div>
      <div>
        <div class="subscribe-card d-flex flex-column">
          <div>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="block in subscriptionBlocksOrdered"
              v-if="block.target !== 'group' && block.canSubscribe === true"
              :key="block.key"
            >
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              <span
                v-html="$t('subscriptionRateText', {price: block.price, months: block.months})">
              </span>
            </div>
          </div>
          <div class="payments-column mx-auto mt-auto mb-3">
            <button
              class="purchase btn btn-primary payment-button payment-item"
              :disabled="!subscription.key"
              @click="showStripe({subscription:subscription.key, coupon:subscription.coupon})"
            >
              <div
                class="svg-icon credit-card-icon"
                v-html="icons.creditCardIcon"
              ></div>
              {{ $t('card') }}
            </button>
            <button
              class="btn payment-item paypal-checkout payment-button"
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
              :class="{'payments-disabled': !subscription.key}"
              :disabled="!subscription.key"
              :amazon-data="{
                type: 'subscription',
                subscription: subscription.key,
                coupon: subscription.coupon
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-200;
  }

  p {
    max-width: 21rem;
  }

  strong {
    font-size: 16px;
  }

  .banner-g1g1 {
    height: 5.75rem;
    background-color: $teal-50;
    color: $white;
  }

  .block-header {
    color: $purple-200;
    letter-spacing: 0.25rem;
    font-size: 20px;
  }

  .flex-spacer {
    width: 4rem;
  }

  .gifts-right {
    filter: flipH;
    transform: scaleX(-1);
  }

  .image-foods {
    background: url(~@/assets/images/subscriber-food.png);
    background-size: contain;
    width: 46px;
    height: 49px;
  }

  .payments-disabled {
    opacity: 0.64;

    .btn, .btn:hover, .btn:active {
      box-shadow: none;
      cursor: default !important;
    }
  }

  .Pet-Jackalope-RoyalPurple {
    margin-top: -1.75rem;
    transform: scale(0.75);
  }

  .subscribe-card {
    width: 28rem;
    height: 31.25rem;
    border-radius: 4px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    background-color: $white;
  }

  .svg-gems {
    width: 42px;
    height: 52px;
  }

  .svg-gifts {
    width: 55px;
    height: 65px;
  }

  .svg-hourglasses {
    width: 43px;
    height: 53px;
  }

  .svg-logo {
    width: 256px;
    height: 56px;
  }
</style>

<script>
import axios from 'axios';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import min from 'lodash/min';
import moment from 'moment';
import { mapState } from '@/libs/store';

import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

import amazonButton from '@/components/payments/amazonButton';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import giftsVertical from '@/assets/svg/gifts-vertical.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import subscriberGems from '@/assets/svg/subscriber-gems.svg';
import subscriberHourglasses from '@/assets/svg/subscriber-hourglasses.svg';

export default {
  components: {
    amazonButton,
  },
  mixins: [paymentsMixin, notificationsMixin],
  data () {
    return {
      loading: false,
      gemCostTranslation: {
        gemCost: planGemLimits.convRate,
        gemLimit: planGemLimits.convRate,
      },
      subscription: {
        key: null,
      },
      // @TODO: Remove the need for this or move it to mixin
      amazonPayments: {},
      paymentMethods: {
        AMAZON_PAYMENTS: 'Amazon Payments',
        STRIPE: 'Stripe',
        GOOGLE: 'Google',
        APPLE: 'Apple',
        PAYPAL: 'Paypal',
        GIFT: 'Gift',
      },
      icons: Object.freeze({
        creditCardIcon,
        giftsVertical,
        logo,
        subscriberGems,
        subscriberHourglasses,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data', credentials: 'credentials' }),
    subscriptionBlocksOrdered () {
      const subscriptions = filter(subscriptionBlocks, o => o.discount !== true);

      return sortBy(subscriptions, [o => o.months]);
    },
    purchasedPlanIdInfo () {
      if (!this.subscriptionBlocks[this.user.purchased.plan.planId]) {
        // @TODO: find which subs are in the common
        // console.log(this.subscriptionBlocks
        // [this.user.purchased.plan.planId]); // eslint-disable-line
        return {
          price: 0,
          months: 0,
          plan: '',
        };
      }

      return {
        price: this.subscriptionBlocks[this.user.purchased.plan.planId].price,
        months: this.subscriptionBlocks[this.user.purchased.plan.planId].months,
        plan: this.user.purchased.plan.paymentMethod,
      };
    },
    subscriptionBlocks () {
      return subscriptionBlocks;
    },
    canEditCardDetails () {
      return Boolean(
        !this.hasCanceledSubscription
        && this.user.purchased.plan.paymentMethod === this.paymentMethods.STRIPE,
      );
    },
    hasSubscription () {
      return Boolean(this.user.purchased.plan.customerId);
    },
    hasCanceledSubscription () {
      return (
        this.hasSubscription
        && Boolean(this.user.purchased.plan.dateTerminated)
      );
    },
    hasPlan () {
      return Boolean(this.user.purchased.plan.planId);
    },
    hasGroupPlan () {
      return this.user.purchased.plan.customerId === 'group-plan';
    },
    hasConsecutiveSubscription () {
      return Boolean(this.user.purchased.plan.consecutive.count)
        || Boolean(this.user.purchased.plan.consecutive.offset);
    },
    purchasedPlanExtraMonthsDetails () {
      return {
        months: parseFloat(this.user.purchased.plan.extraMonths).toFixed(2),
      };
    },
    buyGemsGoldCap () {
      return {
        amount: min(this.gemGoldCap),
      };
    },
    gemGoldCap () {
      const baseCap = 25;
      const gemCapIncrement = 5;
      const capIncrementThreshold = 3;
      const { gemCapExtra } = this.user.purchased.plan.consecutive;
      const blocks = subscriptionBlocks[this.subscription.key].months / capIncrementThreshold;
      const flooredBlocks = Math.floor(blocks);

      const userTotalDropCap = baseCap + gemCapExtra + flooredBlocks * gemCapIncrement;
      const maxDropCap = 50;

      return [userTotalDropCap, maxDropCap];
    },
    numberOfMysticHourglasses () {
      const numberOfHourglasses = subscriptionBlocks[this.subscription.key].months / 3;
      return Math.floor(numberOfHourglasses);
    },
    mysticHourglass () {
      return {
        amount: this.numberOfMysticHourglasses,
      };
    },
    canCancelSubscription () {
      return (
        this.user.purchased.plan.paymentMethod !== this.paymentMethods.GOOGLE
        && this.user.purchased.plan.paymentMethod !== this.paymentMethods.APPLE
        && !this.hasCanceledSubscription
        && !this.hasGroupPlan
      );
    },
    currentMysterySet () {
      return `shop_set_mystery_${moment().format('YYYYMM')}`;
    },
  },
  methods: {
    async applyCoupon (coupon) {
      const response = await axios.post(`/api/v4/coupons/validate/${coupon}`);

      if (!response.data.data.valid) return;

      this.text('Coupon applied!');
      this.subscription.key = 'google_6mo';
    },
    getCancelSubInfo () {
      let payMethod = this.user.purchased.plan.paymentMethod || '';
      if (payMethod === 'Group Plan') payMethod = 'GroupPlan';
      return this.$t(`cancelSubInfo${payMethod}`);
    },
  },
};
</script>
