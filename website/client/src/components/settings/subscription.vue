<template>
  <div>
    <div class="pt-0 px-0">
      <div v-if="!hasSubscription && !hasCanceledSubscription">
        <div class="d-flex flex-column justify-content-center align-items-center
          gradient-swoop mb-3"
        >
          <p class="white block-header mb-2">
            {{ $t('subscribeTo').toUpperCase() }}
          </p>
          <div
            class="d-flex justify-content-center align-items-center mb-4"
          >
            <div
              v-once
              class="svg-icon flip"
              v-html="icons.purpleStars"
            >
            </div>
            <div
              v-once
              class="svg-icon svg-wordmark mx-4"
              v-html="icons.wordmark"
            >
            </div>
            <div
              v-once
              class="svg-icon"
              v-html="icons.purpleStars"
            >
            </div>
          </div>
          <h2 class="white final-header">
            {{ $t('subscribersReceiveBenefits') }}
          </h2>
        </div>
        <div class="d-flex justify-content-center">
          <div class="d-flex flex-column mr-4">
            <div class="d-flex mb-3 align-items-center">
              <div class="sub-benefit bg-gray-600 d-flex mr-4">
                <div
                  v-once
                  class="svg-icon svg-gems m-auto"
                  v-html="icons.subscriberGems"
                ></div>
              </div>
              <div class="w-330p my-auto">
                <h3 class="mb-1"> {{ $t('buyGemsGold') }} </h3>
                <p> {{ $t('subscriptionBenefit1') }} </p>
              </div>
            </div>
            <div class="d-flex mb-3 align-items-center">
              <div class="sub-benefit bg-gray-600 d-flex mr-4">
                <Sprite
                  :image-name="currentMysterySet"
                  class="m-auto"
                />
              </div>
              <div class="w-330p my-auto">
                <h3> {{ $t('monthlyMysteryItems') }} </h3>
                <p> {{ $t('subscriptionBenefit4', {
                  month,
                  currentMysterySetName,
                }) }} </p>
              </div>
            </div>
            <div class="d-flex mb-3 align-items-center">
              <div class="sub-benefit bg-gray-600 d-flex mr-4">
                <div
                  v-once
                  class="svg-icon svg-hourglasses m-auto"
                  v-html="icons.subscriberHourglasses"
                ></div>
              </div>
              <div class="w-330p my-auto">
                <h3> {{ $t('mysticHourglassesTooltip') }} </h3>
                <p> {{ $t('subscriptionBenefit6') }} </p>
              </div>
            </div>
            <div class="d-flex mb-3 align-items-center">
              <div class="sub-benefit bg-gray-600 d-flex mr-4">
                <div
                  v-once
                  class="svg-icon svg-jackalope m-auto"
                  v-html="icons.jackalope"
                ></div>
              </div>
              <div class="w-330p my-auto">
                <h3> {{ $t('exclusiveJackalopePet') }} </h3>
                <p> {{ $t('subscriptionBenefit5') }} </p>
              </div>
            </div>
            <div class="d-flex mb-3 align-items-center">
              <div class="sub-benefit bg-gray-600 d-flex mr-4">
                <div
                  v-once
                  class="svg-icon svg-food m-auto"
                  v-html="icons.subscriberFood"
                ></div>
              </div>
              <div class="w-330p my-auto">
                <h3> {{ $t('doubleDropCap') }} </h3>
                <p> {{ $t('subscriptionBenefit3') }} </p>
              </div>
            </div>
          </div>
          <div>
            <div class="my-auto d-flex flex-column">
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
        <div class="mx-auto">
          <div
            v-if="hasSubscription && !hasCanceledSubscription"
            class="d-flex flex-column align-items-center pt-4"
          >
            <div class="round-container bg-green-10
              d-flex align-items-center justify-content-center"
            >
              <div
                v-once
                class="svg-icon svg-check"
                v-html="icons.checkmarkIcon"
              ></div>
            </div>
            <h2 class="green-10 mx-auto mb-75">
              {{ $t('youAreSubscribed') }}
            </h2>
            <div
              v-if="hasGroupPlan"
              class="mx-5 mb-4 text-center"
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
                d-flex justify-content-center align-items-center mb-4"
                @click="redirectToStripeEdit()"
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
              class="svg-icon mb-4"
              :class="paymentMethodLogo.class"
              v-html="paymentMethodLogo.icon"
            >
            </div>
            <div
              v-if="purchasedPlanExtraMonthsDetails.months > 0"
              class="extra-months green-10 py-2 px-3 mb-4"
              v-html="$t('purchasedPlanExtraMonths',
                         {months: purchasedPlanExtraMonthsDetails.months})"
            >
            </div>
          </div>
          <div
            v-if="hasGiftSubscription"
            class="d-flex flex-column align-items-center mt-4"
          >
            <div class="round-container bg-green-10
              d-flex align-items-center justify-content-center"
            >
              <div
                v-once
                class="svg-icon svg-check"
                v-html="icons.checkmarkIcon"
              ></div>
            </div>
            <h2 class="green-10 mx-auto mb-75">
              {{ $t('youAreSubscribed') }}
            </h2>
            <div
              class="mx-4 text-center mb-4 lh-71"
            >
              <span v-once>
                {{ $t('haveNonRecurringSub') }}
              </span>
              <span
                v-once
                v-html="$t('subscriptionInactiveDate', {date: subscriptionEndDate})"
              >
              </span>
            </div>
            <h2 v-once>
              {{ $t('switchToRecurring') }}
            </h2>
            <small
              v-once
              class="mx-4 mb-3 text-center"
            >
              {{ $t('continueGiftSubBenefits') }}
            </small>
            <subscription-options
              :note="'subscriptionCreditConversion'"
              class="w-100 mb-2"
            />
          </div>
          <div
            v-else-if="hasCanceledSubscription"
            class="d-flex flex-column align-items-center mt-4"
          >
            <div class="round-container bg-gray-300
              d-flex align-items-center justify-content-center"
            >
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
            class="bg-gray-700 py-3 mb-3 text-center"
          >
            <div class="header-mini mb-3">
              {{ $t('subscriptionStats') }}
            </div>
            <div class="d-flex">
              <div class="stat-column">
                <div class="d-flex justify-content-center align-items-center">
                  <div
                    v-once
                    class="svg-icon svg-calendar mr-1"
                    v-html="icons.calendarIcon"
                  >
                  </div>
                  <div class="number-heavy">
                    {{ user.purchased.plan.consecutive.count }}
                  </div>
                </div>
                <div class="stats-label">
                  {{ $t('subMonths') }}
                </div>
              </div>
              <div class="stats-spacer"></div>
              <div class="stat-column">
                <div class="d-flex justify-content-center align-items-center">
                  <div
                    v-once
                    class="svg-icon svg-gem mr-1"
                    v-html="icons.gemIcon"
                  >
                  </div>
                  <div class="number-heavy">
                    {{ gemCap }}
                  </div>
                </div>
                <div class="stats-label">
                  {{ $t('gemCap') }}
                </div>
              </div>
              <div class="stats-spacer"></div>
              <div class="stat-column">
                <div class="d-flex justify-content-center align-items-center">
                  <div
                    v-once
                    class="svg-icon svg-hourglass mt-1 mr-1"
                    v-html="icons.hourglassIcon"
                  >
                  </div>
                  <div class="number-heavy">
                    {{ nextHourGlass }}
                  </div>
                </div>
                <div class="stats-label">
                  {{ $t('nextHourglass') }}*
                </div>
              </div>
            </div>
            <div
              v-once
              class="mt-4 nextHourglassDescription"
            >
              *{{ $t('nextHourglassDescription') }}
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-center mb-3">
            <div
              v-once
              class="svg-icon svg-heart mb-2"
              v-html="icons.heartIcon"
            >
            </div>
            <div class="thanks-for-support">
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
    </div>
    <div class="d-flex flex-column justify-content-center">
      <div class="d-flex justify-content-center">
        <div class="purple-bar my-auto"></div>
        <div
          v-once
          class="svg-icon mx-2"
          v-html="icons.dividerStars"
        ></div>
        <div class="purple-bar my-auto"></div>
      </div>
      <div class="d-flex flex-column align-items-center mt-3">
        <div
          v-once
          class="svg-icon svg-gift-box mb-2"
          v-html="icons.giftBox"
        >
        </div>
        <p class="purple-300 mb-3">
          {{ $t('giftSubscription') }}
        </p>
        <button class="btn btn-secondary mb-5" @click="showSelectUser()">
          {{ $t('giftASubscription') }}
        </button>
      </div>
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

  h3 {
    line-height: 24px;
  }

  p {
    margin-bottom: 0px;
    line-height: 24px;
  }

  small {
    color: $gray-100;
    font-size: 12px ;
    line-height: 1.33;
  }

  strong {
    font-size: 16px;
  }

  .block-header {
    letter-spacing: 1ch;
    font-weight: 700;
    top: 24px;
  }

  .btn-secondary {
    width: 448px;
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
    border-radius: 8px;
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

  .final-header {
    margin-bottom: 70px;
  }

  .flip {
    filter: flipH;
    transform: scaleX(-1);
  }

  .gradient-swoop {
    background-image: url('@/assets/svg/gradient-swoop.svg');
    height: 274px;
    width: 1440px;
  }

  .header-mini {
    font-size: 12px;
    font-weight: bold;
  }

  .lh-71 {
    line-height: 1.71;
  }

  .muted {
    font-size: 14px;
    color: $gray-200;
  }

  .number-heavy {
    font-size: 20px;
    font-weight: bold;
    line-height: 1.4;
    color: $gray-50;
  }

  .position-absolute {
    position: absolute;
  }

  .purple-bar {
    background-color: $purple-400;
    height: 1px;
    width: 432px;
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
    color: $gray-100;
    margin-top: 6px;
    font-weight: bold;
    line-height: 1.33;
  }

  .stats-spacer {
    width: 1px;
    height: 3rem;
    background-color: $gray-500;
  }

  .sub-benefit {
    width: 94px;
    height: 94px;
    border-radius: 8px;
  }

  .svg-amazon-pay {
    width: 208px;
  }

  .svg-apple-pay {
    width: 97.1px;
    height: 40px;
  }

  .svg-calendar {
    width: 24px;
    height: 24px;

    margin-right: 2px;
  }

  .svg-check {
    width: 36px;
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

  .svg-food {
    width: 60px;
    height: 58px;
  }

  .svg-gem {
    width: 24px;
    height: 24px;

    margin-right: 2px;
  }

  .svg-gems {
    width: 54px;
    height: 54px;
  }

  .svg-gift-box {
    width: 24px;
    height: 24px;
  }

  .svg-google-pay {
    width: 99.7px;
    height: 40px;
  }

  .svg-heart {
    width: 24px;
    height: 24px;
  }

  .svg-hourglass {
    width: 24px;
    height: 24px;

    margin-right: 2px;
  }

  .svg-hourglasses {
    width: 39px;
    height: 54px;
  }

  .svg-jackalope {
    width: 38px;
    height: 44px;
  }

  .svg-logo {
    width: 256px;
    height: 56px;
  }

  .svg-paypal {
    width: 148px;
    height: 40px;
  }

  .w-330p {
    width: 330px;
  }

  .w-55 {
    width: 55%;
  }

  .nextHourglassDescription {
    font-size: 12px;
    font-style: italic;
    line-height: 1.33;
    color: $gray-100;
    margin-left: 100px;
    margin-right: 100px;
  }

  .justify-content-evenly {
    justify-content: space-evenly;
  }

  .thanks-for-support {
    font-size: 12px;
    line-height: 1.33;
    text-align: center;
    color: $gray-100;
  }

  .stat-column {
    width: 33%;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import { getPlanContext } from '@/../../common/script/cron';
import { mapState } from '@/libs/store';

import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

import subscriptionOptions from './subscriptionOptions.vue';
import Sprite from '@/components/ui/sprite';

import amazonPayLogo from '@/assets/svg/amazonpay.svg';
import applePayLogo from '@/assets/svg/apple-pay-logo.svg';
import calendarIcon from '@/assets/svg/calendar-purple.svg';
import checkmarkIcon from '@/assets/svg/check.svg';
import closeIcon from '@/assets/svg/close.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import dividerStars from '@/assets/svg/divider-stars.svg';
import gemIcon from '@/assets/svg/gem.svg';
import giftBox from '@/assets/svg/gift-purple.svg';
import googlePayLogo from '@/assets/svg/google-pay-logo.svg';
import heartIcon from '@/assets/svg/health.svg';
import hourglassIcon from '@/assets/svg/hourglass.svg';
import jackalope from '@/assets/svg/jackalope.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import paypalLogo from '@/assets/svg/paypal-logo.svg';
import purpleStars from '@/assets/svg/stars-purple.svg';
import subscriberFood from '@/assets/svg/subscriber-food.svg';
import subscriberGems from '@/assets/svg/subscriber-gems.svg';
import subscriberHourglasses from '@/assets/svg/subscriber-hourglasses.svg';
import wordmark from '@/assets/svg/habitica-logo.svg';

export default {
  components: {
    subscriptionOptions,
    Sprite,
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
        dividerStars,
        gemIcon,
        giftBox,
        googlePayLogo,
        heartIcon,
        hourglassIcon,
        jackalope,
        logo,
        paypalLogo,
        purpleStars,
        subscriberFood,
        subscriberGems,
        subscriberHourglasses,
        wordmark,
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
    hasGiftSubscription () {
      return this.user.purchased.plan.customerId === 'Gift';
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
      return Boolean(this.user.purchased.plan.consecutive.count);
    },
    purchasedPlanExtraMonthsDetails () {
      return {
        months: parseFloat(this.user.purchased.plan.extraMonths).toFixed(2),
      };
    },
    gemCap () {
      return planGemLimits.convCap
          + this.user.purchased.plan.consecutive.gemCapExtra;
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
    month () {
      return moment().format('MMMM');
    },
    currentMysterySetName () {
      return this.$t(`mysterySet${moment().format('YYYYMM')}`);
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
    nextHourGlassDate () {
      const currentPlanContext = getPlanContext(this.user, new Date());

      return currentPlanContext.nextHourglassDate;
    },
    nextHourGlass () {
      const nextHourglassMonth = this.nextHourGlassDate.format('MMM YYYY');

      return nextHourglassMonth;
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('subscription'),
    });
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
