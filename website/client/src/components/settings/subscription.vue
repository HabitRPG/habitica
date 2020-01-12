<template>
  <div class="standard-page pt-0 px-0">
    <h1>{{ $t('subscription') }}</h1>
    <div class="row">
      <div class="col-6">
        <h2>{{ $t('benefits') }}</h2>
        <ul>
          <li>
            <span
              class="hint"
              :popover="$t('buyGemsGoldText', {gemCostTranslation})"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('buyGemsGold') }}</span>
            <span
              v-if="subscription.key !== 'basic_earned'"
              class="badge badge-success"
            >{{ $t('buyGemsGoldCap', buyGemsGoldCap) }}</span>
          </li>
          <li>
            <span
              class="hint"
              :popover="$t('retainHistoryText')"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('retainHistory') }}</span>
          </li>
          <li>
            <span
              class="hint"
              :popover="$t('doubleDropsText')"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('doubleDrops') }}</span>
          </li>
          <li>
            <span
              class="hint"
              :popover="$t('mysteryItemText')"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('mysteryItem') }}</span>
            <div v-if="subscription.key !== 'basic_earned'">
              <div class="badge badge-success">
                {{ $t('mysticHourglass', mysticHourglass) }}
              </div>
              <div class="small muted">
                {{ $t('mysticHourglassText') }}
              </div>
            </div>
          </li>
          <li>
            <span
              class="hint"
              :popover="$t('exclusiveJackalopePetText')"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('exclusiveJackalopePet') }}</span>
          </li>
          <li>
            <span
              class="hint"
              :popover="$t('supportDevsText')"
              popover-trigger="mouseenter"
              popover-placement="right"
            >{{ $t('supportDevs') }}</span>
          </li>
        </ul>
      </div>
      <div class="col-6">
        <h2>Plan</h2>
        <table
          v-if="hasSubscription"
          class="table alert alert-info"
        >
          <tr v-if="hasCanceledSubscription">
            <td class="alert alert-warning">
              <span class="noninteractive-button btn-danger">{{ $t('canceledSubscription') }}</span>
              <i class="glyphicon glyphicon-time"></i>
              {{ $t('subCanceled') }} &nbsp;
              <strong>{{ dateTerminated }}</strong>
            </td>
          </tr>
          <tr v-if="!hasCanceledSubscription">
            <td>
              <h4>{{ $t('subscribed') }}</h4>
              <p v-if="hasPlan && !hasGroupPlan">
                {{ $t('purchasedPlanId', purchasedPlanIdInfo) }}
              </p>
              <p v-if="hasGroupPlan">
                {{ $t('youHaveGroupPlan') }}
              </p>
            </td>
          </tr>
          <tr v-if="user.purchased.plan.extraMonths">
            <td>
              <span class="glyphicon glyphicon-credit-card"></span>
              &nbsp; {{ $t('purchasedPlanExtraMonths', purchasedPlanExtraMonthsDetails) }}
            </td>
          </tr>
          <tr v-if="hasConsecutiveSubscription">
            <td>
              <span class="glyphicon glyphicon-forward"></span>
              &nbsp; {{ $t('consecutiveSubscription') }}
              <ul class="list-unstyled">
                <li>{{ $t('consecutiveMonths') }} {{ user.purchased.plan.consecutive.count + user.purchased.plan.consecutive.offset }}</li> <!-- eslint-disable-line max-len -->
                <li>{{ $t('gemCapExtra') }} {{ user.purchased.plan.consecutive.gemCapExtra }}</li>
                <li>{{ $t('mysticHourglasses') }} {{ user.purchased.plan.consecutive.trinkets }}</li> <!-- eslint-disable-line max-len -->
              </ul>
            </td>
          </tr>
        </table>
        <div v-if="!hasSubscription || hasCanceledSubscription">
          <h4 v-if="hasCanceledSubscription">
            {{ $t("resubscribe") }}
          </h4>
          <div class="form-group reduce-top-margin">
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="block in subscriptionBlocksOrdered"
              v-if="block.target !== 'group' && block.canSubscribe === true"
              :key="block.key"
              class="radio"
            >
              <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              <label>
                <input
                  v-model="subscription.key"
                  type="radio"
                  name="subRadio"
                  :value="block.key"
                >
                <span v-if="block.original">
                  <span class="label label-success line-through">${{ block.original }}</span>
                  {{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}
                </span>
                <span
                  v-if="!block.original"
                >{{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}</span>
              </label>
            </div>
          </div>
          <div class="form-inline">
            <div class="form-group">
              <input
                v-model="subscription.coupon"
                class="form-control"
                type="text"
                :placeholder="$t('couponPlaceholder')"
              >
            </div>
            <div class="form-group">
              <button
                class="btn btn-primary"
                type="button"
                @click="applyCoupon(subscription.coupon)"
              >
                {{ $t("apply") }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="hasSubscription">
          <div
            v-if="canEditCardDetails"
            class="btn btn-primary"
            @click="showStripeEdit()"
          >
            {{ $t('subUpdateCard') }}
          </div>
          <div
            v-if="canCancelSubscription && !loading"
            class="btn btn-sm btn-danger"
            @click="cancelSubscriptionConfirm()"
          >
            {{ $t('cancelSub') }}
          </div>
          <small
            v-if="!canCancelSubscription && !hasCanceledSubscription"
            v-html="getCancelSubInfo()"
          ></small>
        </div>
        <div
          v-if="!hasSubscription || hasCanceledSubscription"
          class="subscribe-pay"
        >
          <h3>{{ $t('subscribeUsing') }}</h3>
          <div class="payments-column">
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
              :amazon-data="{
                type: 'subscription', subscription: subscription.key, coupon: subscription.coupon}"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <h2 v-once>
          {{ $t('giftSubscription') }}
        </h2>
        <ol>
          <li v-once>
            {{ $t('giftSubscriptionText1') }}
          </li>
          <li v-once>
            {{ $t('giftSubscriptionText2') }}
          </li>
          <li v-once>
            {{ $t('giftSubscriptionText3') }}
          </li>
        </ol>
        <h4 v-once>
          {{ $t('giftSubscriptionText4') }}
        </h4>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .badge.badge-success {
    color: $white;
  }

  .subscribe-pay {
    margin-top: 1em;
  }
</style>

<script>
import axios from 'axios';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import min from 'lodash/min';
import { mapState } from '@/libs/store';

import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

import amazonButton from '@/components/payments/amazonButton';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';

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
        key: 'basic_earned',
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
