<template>
  <div class="standard-page pt-0 px-0">
    <div v-if="!hasSubscription && !hasCanceledSubscription">
      <div class="row mt-3">
        <div class="block-header mx-auto">
          {{ $t('support') }}
        </div>
      </div>
      <div class="row mb-5">
        <div
          v-once
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
                v-once
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
                v-once
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
            <subscription-options class="mb-4" />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="hasSubscription"
      class="d-flex flex-column align-items-center"
    >
      <h1 class="mt-4 mx-auto">
        {{ $t('subscription') }}
      </h1>
      <div class="subscribe-card mx-auto">
        <div
          v-if="hasSubscription && !hasCanceledSubscription"
          class="d-flex flex-column align-items-center my-4"
        >
          <div class="round-container bg-green-10 d-flex align-items-center justify-content-center">
            <div
              v-once
              class="svg-icon svg-check"
              v-html="icons.checkmarkIcon"
            ></div>
          </div>
          <h2 class="green-10 mx-auto">
            {{ $t('youAreSubscribed') }}
          </h2>
          <div
            v-if="hasGroupPlan"
            class="mx-5 text-center"
          >
            {{ $t('youHaveGroupPlan') }}
          </div>
          <div
            v-else
            class="w-55 text-center"
            v-html="$t('paymentSubBillingWithMethod', {
              amount: purchasedPlanIdInfo.price,
              months: purchasedPlanIdInfo.months,
              paymentMethod: purchasedPlanIdInfo.plan
            })"
          >
          </div>
          <div
            v-if="canEditCardDetails"
            class="mt-4 text-center"
          >
            <div class="font-weight-bold gray-10 mb-2">
              {{ $t('needToUpdateCard') }}
            </div>
            <button
              class="btn btn-primary btn-update-card
              d-flex justify-content-center align-items-center"
              @click="showStripeEdit()"
            >
              <div
                v-once
                class="svg-icon svg-credit-card mr-2"
                v-html="icons.creditCardIcon"
              ></div>
              <div>{{ $t('subUpdateCard') }}</div>
            </button>
          </div>
          <div
            v-else
            class="svg-icon"
            :class="paymentMethodLogo.class"
            v-html="paymentMethodLogo.icon"
          >
          </div>
          <div
            v-if="purchasedPlanExtraMonthsDetails.months > 0"
            class="extra-months green-10 py-2 px-3 mt-4"
            v-html="$t('purchasedPlanExtraMonths',
                       {months: purchasedPlanExtraMonthsDetails.months})"
          >
          </div>
        </div>
        <div
          v-if="hasCanceledSubscription"
          class="d-flex flex-column align-items-center mt-4"
        >
          <div class="round-container bg-gray-300 d-flex align-items-center justify-content-center">
            <div
              v-once
              class="svg-icon svg-close"
              v-html="icons.closeIcon"
            ></div>
          </div>
          <h2 class="gray-50">
            {{ $t('subscriptionCanceled') }}
          </h2>
          <div
            class="w-75 text-center mb-4"
            v-html="$t('subscriptionInactiveDate', {date: subscriptionEndDate})"
          >
          </div>
          <h2>{{ $t('readyToResubscribe') }}</h2>
          <subscription-options class="w-100 mb-2" />
        </div>
        <div
          v-if="hasSubscription"
          class="bg-gray-700 p-2 text-center"
        >
          <div class="header-mini mb-3">
            {{ $t('subscriptionStats') }}
          </div>
          <div class="d-flex justify-content-around">
            <div class="ml-4 mr-3">
              <div class="d-flex justify-content-center align-items-center">
                <div
                  v-once
                  class="svg-icon svg-calendar mr-2"
                  v-html="icons.calendarIcon"
                >
                </div>
                <div class="number-heavy">
                  {{ user.purchased.plan.consecutive.count +
                    user.purchased.plan.consecutive.offset }}
                </div>
              </div>
              <div class="stats-label">
                {{ $t('subMonths') }}
              </div>
            </div>
            <div class="stats-spacer"></div>
            <div>
              <div class="d-flex justify-content-center align-items-center">
                <div
                  v-once
                  class="svg-icon svg-gem mr-2"
                  v-html="icons.gemIcon"
                >
                </div>
                <div class="number-heavy">
                  {{ user.purchased.plan.consecutive.gemCapExtra }}
                </div>
              </div>
              <div class="stats-label">
                {{ $t('gemCapExtra') }}
              </div>
            </div>
            <div class="stats-spacer"></div>
            <div>
              <div class="d-flex justify-content-center align-items-center">
                <div
                  v-once
                  class="svg-icon svg-hourglass mt-1 mr-2"
                  v-html="icons.hourglassIcon"
                >
                </div>
                <div class="number-heavy">
                  {{ user.purchased.plan.consecutive.trinkets }}
                </div>
              </div>
              <div class="stats-label">
                {{ $t('mysticHourglassesTooltip') }}
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-center mt-4 mb-3">
          <div
            v-once
            class="svg-icon svg-heart mb-1"
            v-html="icons.heartIcon"
          >
          </div>
          <div class="stats-label">
            {{ $t('giftSubscriptionText4') }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="hasSubscription && !hasCanceledSubscription"
      class="d-flex flex-column align-items-center mt-3"
    >
      <div class="cancel-card p-4 text-center">
        <h2 class="maroon-50">
          {{ $t('cancelYourSubscription') }}
        </h2>
        <div v-if="hasGroupPlan">
          {{ $t('cancelSubInfoGroupPlan') }}
        </div>
        <div
          v-if="!hasGroupPlan && !canCancelSubscription"
          v-html="$t(`cancelSubInfo${user.purchased.plan.paymentMethod}`)"
        >
        </div>
        <div
          v-if="canCancelSubscription"
          v-html="$t('cancelSubAlternatives')"
        >
        </div>
        <div
          class="btn btn-danger mt-4"
          :class="{disabled: !canCancelSubscription}"
          :disabled="!canCancelSubscription"
          @click="cancelSubscriptionConfirm({canCancel: canCancelSubscription})"
        >
          {{ $t('cancelSub') }}
        </div>
      </div>
    </div>
    <div class="d-flex flex-column align-items-center mt-4">
      <div
        v-once
        class="svg-icon svg-gift-box m-auto"
        v-html="icons.giftBox"
      >
      </div>
      <div class="muted mx-auto mt-3 mb-1">
        {{ $t('giftSubscription') }}
      </div>
      <a
        class="mx-auto"
        @click="showSelectUser()"
      >
        {{ $t('giftASubscription') }}
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  a {
    color: $purple-300;
  }

  h1, h2 {
    color: $purple-200;
  }

  p {
    max-width: 21rem;
  }

  strong {
    font-size: 16px;
  }

  .bg-green-10 {
    background-color: $green-10;
  }

  .bg-gray-300 {
    background-color: $gray-300;
  }

  .bg-gray-700 {
    background-color: $gray-700;
  }

  .block-header {
    color: $purple-200;
    letter-spacing: 0.25rem;
    font-size: 20px;
  }

  .btn-update-card {
    width: 12.5rem;
    height: 2.5rem;
    border-radius: 4px;
    font-size: 14px;
  }

  .cancel-card {
    width: 28rem;
    border: 2px solid $gray-500;
    border-radius: 4px;
  }

  .disabled {
    opacity: 0.64;

    .btn, .btn:hover, .btn:active {
      box-shadow: none;
      cursor: default !important;
    }
  }

  .extra-months {
    border-radius: 2px;
    border: 1px solid $green-50;
  }

  .flex-spacer {
    width: 4rem;
  }

  .gray-10 {
    color: $gray-10;
  }

  .gray-50 {
    color: $gray-50;
  }

  .green-10 {
    color: $green-10;
  }

  .header-mini {
    font-size: 12px;
    font-weight: bold;
  }

  .image-foods {
    background: url(~@/assets/images/subscriber-food.png);
    background-size: contain;
    width: 46px;
    height: 49px;
  }

  .maroon-50 {
    color: $maroon-50;
  }

  .muted {
    font-size: 14px;
    color: $gray-200;
  }

  .number-heavy {
    font-size: 24px;
  }

  .Pet-Jackalope-RoyalPurple {
    margin-top: -1.75rem;
    transform: scale(0.75);
  }

  .round-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin: 0 auto;
    margin-bottom: 16px;
  }

  .stats-label {
    font-size: 12px;
    color: $gray-200;
  }

  .stats-spacer {
    width: 1px;
    height: 3rem;
    background-color: $gray-500;
  }

  .subscribe-card {
    width: 28rem;
    border-radius: 4px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    background-color: $white;
  }

  .subscribe-option {
    border-bottom: 1px solid $gray-600;
  }

  .svg-amazon-pay {
    width: 208px;
  }

  .svg-apple-pay {
    width: 97.1px;
    height: 40px;
  }

  .svg-calendar, .svg-heart {
    width: 24px;
    height: 24px;
  }

  .svg-check {
    width: 35.1px;
    height: 28px;
    color: $white;
  }

  .svg-close {
    width: 26px;
    height: 26px;

    & ::v-deep svg path {
      stroke: $white;
      stroke-width: 3;
    }
  }

  .svg-credit-card {
    width: 21.3px;
    height: 16px;
  }

  .svg-gem {
    width: 32px;
    height: 28px;
  }

  .svg-gems {
    width: 42px;
    height: 52px;
  }

  .svg-google-pay {
    width: 99.7px;
    height: 40px;
  }

  .svg-hourglass {
    width: 28px;
    height: 28px;
  }

  .svg-gift-box {
    width: 32px;
    height: 32px;
  }

  .svg-hourglasses {
    width: 43px;
    height: 53px;
  }

  .svg-logo {
    width: 256px;
    height: 56px;
  }

  .svg-paypal {
    width: 148px;
    height: 40px;
  }

  .w-55 {
    width: 55%;
  }
</style>

<script>
import axios from 'axios';
import min from 'lodash/min';
import moment from 'moment';
import { mapState } from '@/libs/store';

import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

import subscriptionOptions from './subscriptionOptions.vue';

import amazonPayLogo from '@/assets/svg/amazonpay.svg';
import applePayLogo from '@/assets/svg/apple-pay-logo.svg';
import calendarIcon from '@/assets/svg/calendar-purple.svg';
import checkmarkIcon from '@/assets/svg/check.svg';
import closeIcon from '@/assets/svg/close.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import gemIcon from '@/assets/svg/gem.svg';
import giftBox from '@/assets/svg/gift-purple.svg';
import googlePayLogo from '@/assets/svg/google-pay-logo.svg';
import heartIcon from '@/assets/svg/health.svg';
import hourglassIcon from '@/assets/svg/hourglass.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import paypalLogo from '@/assets/svg/paypal-logo.svg';
import subscriberGems from '@/assets/svg/subscriber-gems.svg';
import subscriberHourglasses from '@/assets/svg/subscriber-hourglasses.svg';

export default {
  components: {
    subscriptionOptions,
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
        amazonPayLogo,
        applePayLogo,
        calendarIcon,
        checkmarkIcon,
        closeIcon,
        creditCardIcon,
        gemIcon,
        giftBox,
        googlePayLogo,
        heartIcon,
        hourglassIcon,
        logo,
        paypalLogo,
        subscriberGems,
        subscriberHourglasses,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data', credentials: 'credentials' }),
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
    paymentMethodLogo () {
      switch (this.user.purchased.plan.paymentMethod) {
        case this.paymentMethods.AMAZON_PAYMENTS:
          return {
            icon: this.icons.amazonPayLogo,
            class: 'svg-amazon-pay mt-3',
          };
        case this.paymentMethods.APPLE:
          return {
            icon: this.icons.applePayLogo,
            class: 'svg-apple-pay mt-4',
          };
        case this.paymentMethods.GOOGLE:
          return {
            icon: this.icons.googlePayLogo,
            class: 'svg-google-pay mt-4',
          };
        case this.paymentMethods.PAYPAL:
          return {
            icon: this.icons.paypalLogo,
            class: 'svg-paypal mt-4',
          };
        default:
          return {
            icon: null,
            class: null,
          };
      }
    },
    subscriptionEndDate () {
      return moment(this.user.purchased.plan.dateTerminated).format('MM/DD/YYYY');
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
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
  },
};
</script>
