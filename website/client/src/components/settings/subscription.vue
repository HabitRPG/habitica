<template>
  <div>
    <div class="pt-0 px-0">
      <div v-if="!hasSubscription && !hasCanceledSubscription">
        <div class="d-flex flex-column justify-content-center align-items-center
          purple-gradient full-banner mb-4"
        >
          <p class="white header-top mt-4 mb-2">
            {{ $t('subscribeTo').toUpperCase() }}
          </p>
          <div
            class="header-mid d-flex justify-content-center align-items-center
              mb-4 position-relative"
          >
            <div
              v-once
              class="svg-icon flip position-absolute left-0"
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
              class="svg-icon position-absolute right-0"
              v-html="icons.purpleStars"
            >
            </div>
          </div>
          <h2 class="white">
            {{ $t('subscribersReceiveBenefits') }}
          </h2>
        </div>
        <div class="d-flex justify-content-center">
          <div class="d-flex flex-column mr-4">
            <div
              v-if="gemCap > 24"
              class="w-100 green-gradient mb-3 text-center"
            >
              <div class='cap-readout bg-purple-300'>
                <div
                  v-once
                  class="svg-icon svg-gems"
                  v-html="icons.subscriberGems"
                ></div>
                <div class="white label"> {{ $t('gemCap') }}</div>
                <div class="white readout"> {{ gemCap }} / 50</div>
                <div class="progress-bar bg-purple-100">
                  <div
                    class="progress-fill h-100 bg-green-100"
                    :style="`width: ${gemCap / 50 * 100}%`"
                  >
                  </div>
                </div>
                <img src="~@/assets/images/confetti.png">
              </div>
              <small class="teal-1">{{ $t('resubscribeToPickUp') }}</small>
            </div>
            <div v-else class="d-flex mb-3 align-items-center">
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
        <h1 class="mt-4 mx-auto mb-3">
          {{ $t('subscription') }}
        </h1>
        <div class="sub-card bg-white p-4 mb-4">
          <div
            v-if="hasSubscription && !hasCanceledSubscription"
            class="d-flex flex-column align-items-center"
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
            <h2 class="green-10 mx-auto mb-3">
              {{ $t('youAreSubscribed') }}
            </h2>
            <div
              v-if="hasGroupPlan"
              class="mx-5 mb-4 text-center"
            >
              {{ $t('youHaveGroupPlan') }}
            </div>
            <p
              v-else
              class="text-center mb-4"
              v-html="$t('paymentSubBillingWithMethod', {
                amount: purchasedPlanIdInfo.price,
                months: purchasedPlanIdInfo.months,
                paymentMethod: purchasedPlanIdInfo.plan,
              })"
            >
            </p>
            <div
              class="svg svg-icon mb-4"
              :class="paymentMethodLogo.class"
              v-html="paymentMethodLogo.icon"
            >
            </div>
            <div
              v-if="canEditCardDetails"
              class="text-center"
            >
              <button
                class="btn btn-secondary btn-update-card mb-4"
                @click="redirectToStripeEdit()"
              >
                <div>{{ $t('subUpdateCard') }}</div>
              </button>
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
            <h2 class="green-10 mx-auto mb-3">
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
            class="d-flex flex-column align-items-center"
          >
            <div class="round-container bg-gray-100
              d-flex align-items-center justify-content-center"
            >
              <div
                v-once
                class="svg svg-icon svg-close color white"
                v-html="icons.closeIcon"
              ></div>
            </div>
            <h2 class="gray-50">
              {{ $t('subscriptionCanceled') }}
            </h2>
            <div
              class="text-center mb-4"
              v-html="$t('subscriptionInactiveDate', {date: subscriptionEndDate})"
            >
            </div>
            <h2>{{ $t('readyToResubscribe') }}</h2>
            <subscription-options class="w-100 mb-4" :canceled="true"/>
          </div>
          <div
            v-if="hasSubscription"
          >
            <div class="d-flex justify-content-around mb-3">
              <div class="bg-gray-700 d-flex flex-column
                justify-content-center align-items-center stats-card"
              >
                <div class="d-flex justify-content-center align-items-center">
                  <div
                    v-once
                    class="svg-icon svg-calendar mr-2"
                    v-html="icons.calendarIcon"
                  >
                  </div>
                  <div class="number-heavy">
                    {{ user.purchased.plan.consecutive.count }}
                  </div>
                </div>
                <div class="stats-label gray-50">
                  {{ $t('subMonths') }}
                </div>
              </div>
              <div class="bg-gray-700 d-flex flex-column
                justify-content-center align-items-center stats-card"
              >
                <div class="d-flex justify-content-center align-items-center">
                  <div
                    v-once
                    class="svg-icon svg-gem mr-2"
                    v-html="icons.gemIcon"
                  >
                  </div>
                  <div class="number-heavy">
                    {{ gemCap }}
                  </div>
                </div>
                <div class="stats-label gray-50">
                  {{ $t('monthlyGemsLabel') }}
                </div>
              </div>
            </div>
            <div
              class="hourglass-preview purple-gradient d-flex flex-column
              justify-content-center align-items-center position-relative mb-4"
            >
              <div
                v-once
                class="svg svg-icon position-absolute left-24"
                v-html="icons.hourglassLeft"
              >
              </div>
              <div v-if="nextHourGlass" class="text-center">
                <div
                  class="white mb-1"
                >
                  {{ nextHourGlass }}
                </div>
                <div
                  v-once
                  class="purple-600"
                  >
                  {{ $t('nextHourglass') }}
                </div>
              </div>
              <p class="w-50 text-center" v-else>
                {{ $t('subscribeAgainContinueHourglasses') }}
              </p>
              <div
                v-once
                class="svg svg-icon position-absolute right-24"
                v-html="icons.hourglassRight"
              >
              </div>
            </div>
            <div
              v-once
              class="text-center next-hourglass-description gray-50"
            >
              {{ $t('nextHourglassDescription') }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="hasSubscription && !hasCanceledSubscription"
        class="d-flex flex-column align-items-center mb-4 w-448p text-center"
      >
        <a
          v-if="canCancelSubscription"
          class="maroon-50"
          @click="cancelSubscriptionConfirm({canCancel: canCancelSubscription})"
        >
          {{ $t('cancelYourSubscription') }}
        </a>
        <div v-if="hasGroupPlan">
          {{ $t('cancelSubInfoGroupPlan') }}
        </div>
        <div
          v-if="!hasGroupPlan && !canCancelSubscription"
          v-html="$t(`cancelSubInfo${user.purchased.plan.paymentMethod}`)"
        >
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
        <button class="btn btn-secondary w-448p mb-5" @click="showSelectUser()">
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
    line-height: 1.71;
  }

  small {
    color: $gray-100;
    font-size: 12px ;
    line-height: 1.33;
  }

  strong {
    font-size: 16px;
  }

  .btn-update-card {
    line-height: 1.714;
    border-radius: 4px;
    font-size: 14px;
    padding: 4px 12px;
    width: fit-content;
  }

  .cancel-card {
    width: 28rem;
    border: 2px solid $gray-500;
    border-radius: 8px;
  }

  .cap-readout {
    height: 76px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    position: relative;

    img {
      position: absolute;
      top: 2px;
      right: 3px;
    }

    .label {
      left: 92px;
    }

    .progress-bar {
      position: absolute;
      top: 42px;
      left: 92px;
      width: 330px;
      height: 12px;
      border-radius: 99px;
    }

    .readout {
      right: 22px;
    }

    .svg-gems {
      position: absolute;
      left: 14px;
      top: 14px;
    }

    .white {
      position: absolute;
      font-weight: 700;
      font-size: 20px;
      line-height: 1.2;
      top: 14px;
    }
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

  .flip {
    transform: scaleX(-1);
  }

  .full-banner {
    height: 180px;
    width: 100vw;
  }

  @media only screen and (max-width: 922px) {
    .full-banner {
      width: 100%;
    }
  }

  .green-gradient {
    background: linear-gradient(90deg, rgba(119, 244, 199, 1), rgba(114, 207, 255, 1));
    padding: 2px 2px 0px 2px;
    border-radius: 8px;
    height: 108px;

    .teal-1 {
      position: relative;
      font-weight: 700;
      top: 4px;
    }
  }

  .header-mid {
    width: 347px;
  }

  .header-top {
    letter-spacing: 1ch;
    font-weight: 700;
  }

  .hourglass-preview {
    height: 92px;
    border-radius: 8px;
    font-weight: 700;

    p {
      color: $white;
      line-height: 1.4;
    }

    .white {
      font-family: 'Roboto Condensed';
      font-size: 20px;
      line-height: 1.4;
    }

    .purple-600 {
      font-size: 12px;
      line-height: 1.33;
    }
  }

  .header-mini {
    font-size: 12px;
    font-weight: bold;
  }

  .justify-content-around {
    gap: 16px;
  }

  .left-0 {
    left: 0px;
  }

  .left-24 {
    left: 24px;
  }

  .lh-71 {
    line-height: 1.71;
  }

  .muted {
    font-size: 14px;
    color: $gray-200;
  }

  .next-hourglass-description {
    font-size: 12px;
    font-style: italic;
    line-height: 1.33;
  }

  .number-heavy {
    font-size: 20px;
    font-weight: bold;
    line-height: 1.4;
    color: $gray-50;
  }

  .purple-bar {
    background-color: $purple-400;
    height: 1px;
    width: 50%;
    max-width: 432px;
  }

  .purple-gradient {
    background-image: linear-gradient($purple-300, $purple-200);
  }

  .right-0 {
    right: 0px;
  }

  .right-24 {
    right: 24px;
  }

  .round-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin: 0 auto;
    margin-bottom: 16px;
  }

  .stats-card {
    border-radius: 8px;
    width: 192px;
    height: 88px;
  }

  .stats-label {
    font-size: 12px;
    margin-top: 6px;
    font-weight: 700;
    line-height: 1.33;
  }

  .sub-benefit {
    width: 94px;
    height: 94px;
    border-radius: 8px;
  }

  .sub-card {
    border-radius: 8px;
    box-shadow: 0px 1px 3px 0px rgba($black, 0.12), 0px 1px 2px 0px rgba($black, 0.24);
    width: 448px;
    background-color: $white;
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
    width: 48px;
    color: $white;
  }

  .svg-close {
    width: 32px;
    height: 32px;
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

  .svg-stripe {
    width: 96px;
  }

  .w-330p {
    width: 330px;
  }

  .w-448p {
    width: 448px;
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
import dividerStars from '@/assets/svg/divider-stars.svg';
import gemIcon from '@/assets/svg/gem.svg';
import giftBox from '@/assets/svg/gift-purple.svg';
import googlePayLogo from '@/assets/svg/google-pay-logo.svg';
import heartIcon from '@/assets/svg/health.svg';
import hourglassIcon from '@/assets/svg/hourglass.svg';
import hourglassLeft from '@/assets/svg/hourglass-sparkle-left.svg';
import hourglassRight from '@/assets/svg/hourglass-sparkle-right.svg';
import jackalope from '@/assets/svg/jackalope.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import paypalLogo from '@/assets/svg/paypal-logo.svg';
import purpleStars from '@/assets/svg/stars-purple.svg';
import stripeLogo from '@/assets/svg/stripe.svg';
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
        dividerStars,
        gemIcon,
        giftBox,
        googlePayLogo,
        heartIcon,
        hourglassIcon,
        hourglassLeft,
        hourglassRight,
        jackalope,
        logo,
        paypalLogo,
        purpleStars,
        stripeLogo,
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
            class: 'svg-amazon-pay',
          };
        case this.paymentMethods.APPLE:
          return {
            icon: this.icons.applePayLogo,
            class: 'svg-apple-pay',
          };
        case this.paymentMethods.GOOGLE:
          return {
            icon: this.icons.googlePayLogo,
            class: 'svg-google-pay',
          };
        case this.paymentMethods.PAYPAL:
          return {
            icon: this.icons.paypalLogo,
            class: 'svg-paypal',
          };
        case this.paymentMethods.STRIPE:
          return {
            icon: this.icons.stripeLogo,
            class: 'svg-stripe',
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
      if (!this.nextHourGlassDate) {
        return null;
      }
      const nextHourglassMonth = this.nextHourGlassDate.format('MMMM');

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
