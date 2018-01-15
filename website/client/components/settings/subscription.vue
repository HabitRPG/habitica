<template lang="pug">
  .standard-page
    h1 {{ $t('subscription') }}
    .row
      .col-6
        h2 {{ $t('benefits') }}
        ul
          li
            span.hint(:popover="$t('buyGemsGoldText', {gemCostTranslation})",
              popover-trigger='mouseenter',
              popover-placement='right') {{ $t('buyGemsGold') }}
            span.badge.badge-success(v-if='subscription.key !== "basic_earned"') {{ $t('buyGemsGoldCap', buyGemsGoldCap) }}
          li
            span.hint(:popover="$t('retainHistoryText')", popover-trigger='mouseenter', popover-placement='right') {{ $t('retainHistory') }}
          li
            span.hint(:popover="$t('doubleDropsText')", popover-trigger='mouseenter', popover-placement='right') {{ $t('doubleDrops') }}
          li
            span.hint(:popover="$t('mysteryItemText')", popover-trigger='mouseenter', popover-placement='right') {{ $t('mysteryItem') }}
            div(v-if='subscription.key !== "basic_earned"')
              .badge.badge-success {{ $t('mysticHourglass', mysticHourglass) }}
              .small.muted {{ $t('mysticHourglassText') }}
          li
            span.hint(:popover="$t('exclusiveJackalopePetText')", popover-trigger='mouseenter', popover-placement='right') {{ $t('exclusiveJackalopePet') }}
          li
            span.hint(:popover="$t('supportDevsText')", popover-trigger='mouseenter', popover-placement='right') {{ $t('supportDevs') }}

      .col-6
        h2 Plan
        table.table.alert.alert-info(v-if='hasSubscription')
          tr(v-if='hasCanceledSubscription'): td.alert.alert-warning
            span.noninteractive-button.btn-danger {{ $t('canceledSubscription') }}
            i.glyphicon.glyphicon-time
            |  {{ $t('subCanceled') }} &nbsp;
            strong {{dateTerminated}}
          tr(v-if='!hasCanceledSubscription'): td
            h4 {{ $t('subscribed') }}
            p(v-if='hasPlan && !hasGroupPlan') {{ $t('purchasedPlanId', purchasedPlanIdInfo) }}
            p(v-if='hasGroupPlan') {{ $t('youHaveGroupPlan') }}
          tr(v-if='user.purchased.plan.extraMonths'): td
            span.glyphicon.glyphicon-credit-card
            | &nbsp; {{ $t('purchasedPlanExtraMonths', purchasedPlanExtraMonthsDetails) }}
          tr(v-if='hasConsecutiveSubscription'): td
            span.glyphicon.glyphicon-forward
            | &nbsp; {{ $t('consecutiveSubscription') }}
            ul.list-unstyled
              li {{ $t('consecutiveMonths') }} {{user.purchased.plan.consecutive.count + user.purchased.plan.consecutive.offset}}
              li {{ $t('gemCapExtra') }} {{user.purchased.plan.consecutive.gemCapExtra}}
              li {{ $t('mysticHourglasses') }} {{user.purchased.plan.consecutive.trinkets}}

        div(v-if='!hasSubscription || hasCanceledSubscription')
          h4(v-if='hasCanceledSubscription') {{ $t("resubscribe") }}
          .form-group.reduce-top-margin
            .radio(v-for='block in subscriptionBlocksOrdered', v-if="block.target !== 'group' && block.canSubscribe === true")
              label
                input(type="radio", name="subRadio", :value="block.key", v-model='subscription.key')
                span(v-if='block.original')
                  span.label.label-success.line-through
                    | ${{block.original }}
                  | {{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}
                span(v-if='!block.original')
                  | {{ $t('subscriptionRateText', {price: block.price, months: block.months}) }}

          .form-inline
            .form-group
              input.form-control(type='text', v-model='subscription.coupon', :placeholder="$t('couponPlaceholder')")
            .form-group
              button.btn.btn-primary(type='button', @click='applyCoupon(subscription.coupon)') {{ $t("apply") }}

        div(v-if='hasSubscription')
          .btn.btn-primary(v-if='canEditCardDetails', @click='showStripeEdit()') {{ $t('subUpdateCard') }}
          .btn.btn-sm.btn-danger(v-if='canCancelSubscription && !loading', @click='cancelSubscription()') {{ $t('cancelSub') }}
          small(v-if='!canCancelSubscription && !hasCanceledSubscription', v-html='getCancelSubInfo()')

        .subscribe-pay(v-if='!hasSubscription || hasCanceledSubscription')
          h3 {{ $t('subscribeUsing') }}
          .row.text-center
            .col-md-4
              button.purchase.btn.btn-primary(@click='showStripe({subscription:subscription.key, coupon:subscription.coupon})', :disabled='!subscription.key') {{ $t('card') }}
            .col-md-4
              a.purchase(:href='paypalPurchaseLink', :disabled='!subscription.key', target='_blank')
                img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png', :alt="$t('paypal')")
            .col-md-4
              a.btn.btn-secondary.purchase(@click="payWithAmazon()")
                img(src='https://payments.amazon.com/gp/cba/button', :alt="$t('amazonPayments')")
    .row
      .col-6
        h2 {{ $t('giftSubscription') }}
        ol
          li {{ $t('giftSubscriptionText1') }}
          li {{ $t('giftSubscriptionText2') }}
          li {{ $t('giftSubscriptionText3') }}
        h4 {{ $t('giftSubscriptionText4') }}
</template>

<style scoped>
  .badge.badge-success {
    color: #fff;
  }

  .subscribe-pay {
    margin-top: 1em;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import min from 'lodash/min';
import { mapState } from 'client/libs/store';

import subscriptionBlocks from '../../../common/script/content/subscriptionBlocks';
import planGemLimits from '../../../common/script/libs/planGemLimits';
import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

export default {
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
    };
  },
  computed: {
    ...mapState({user: 'user.data', credentials: 'credentials'}),
    subscriptionBlocksOrdered () {
      let subscriptions = filter(subscriptionBlocks, (o) => {
        return o.discount !== true;
      });

      return sortBy(subscriptions, [(o) => {
        return o.months;
      }]);
    },
    purchasedPlanIdInfo () {
      if (!this.subscriptionBlocks[this.user.purchased.plan.planId]) {
        // @TODO: find which subs are in the common
        // console.log(this.subscriptionBlocks[this.user.purchased.plan.planId]); // eslint-disable-line
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
        !this.hasCanceledSubscription &&
        this.user.purchased.plan.paymentMethod === this.paymentMethods.STRIPE
      );
    },
    hasSubscription () {
      return Boolean(this.user.purchased.plan.customerId);
    },
    hasCanceledSubscription () {
      return (
        this.hasSubscription &&
        Boolean(this.user.purchased.plan.dateTerminated)
      );
    },
    hasPlan () {
      return Boolean(this.user.purchased.plan.planId);
    },
    hasGroupPlan () {
      return this.user.purchased.plan.customerId === 'group-plan';
    },
    hasConsecutiveSubscription () {
      return Boolean(this.user.purchased.plan.consecutive.count) || Boolean(this.user.purchased.plan.consecutive.offset);
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
      let baseCap = 25;
      let gemCapIncrement = 5;
      let capIncrementThreshold = 3;
      let gemCapExtra = this.user.purchased.plan.consecutive.gemCapExtra;
      let blocks = subscriptionBlocks[this.subscription.key].months / capIncrementThreshold;
      let flooredBlocks = Math.floor(blocks);

      let userTotalDropCap = baseCap + gemCapExtra + flooredBlocks * gemCapIncrement;
      let maxDropCap = 50;

      return [userTotalDropCap, maxDropCap];
    },
    numberOfMysticHourglasses () {
      let numberOfHourglasses = subscriptionBlocks[this.subscription.key].months / 3;
      return Math.floor(numberOfHourglasses);
    },
    mysticHourglass () {
      return {
        amount: this.numberOfMysticHourglasses,
      };
    },
    dateTerminated () {
      if (!this.user.preferences || !this.user.preferences.dateFormat) return this.user.purchased.plan.dateTerminated;
      return moment(this.user.purchased.plan.dateTerminated).format(this.user.preferences.dateFormat.toUpperCase());
    },
    canCancelSubscription () {
      return (
        this.user.purchased.plan.paymentMethod !== this.paymentMethods.GOOGLE &&
        this.user.purchased.plan.paymentMethod !== this.paymentMethods.APPLE &&
        !this.hasCanceledSubscription &&
        !this.hasGroupPlan
      );
    },
  },
  methods: {
    payWithAmazon () {
      this.amazonPaymentsInit({
        type: 'subscription',
        subscription: this.subscription.key,
        coupon: this.subscription.coupon,
      });
    },
    async applyCoupon (coupon) {
      const response = await axios.post(`/api/v3/coupons/validate/${coupon}`);

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
