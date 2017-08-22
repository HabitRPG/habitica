<template lang="pug">
  .standard-page
    amazon-payments-modal(:amazon-payments='amazonPayments')

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
            |  {{ $t('subCanceled') }}
            strong {{user.purchased.plan.dateTerminated | date}}
          tr(v-if='!hasCanceledSubscription'): td
            h4 {{ $t('subscribed') }}
            p(v-if='hasPlan && !hasGroupPlan') {{ $t('purchasedPlanId', {purchasedPlanIdInfo}) }}
            p(v-if='hasGroupPlan') {{ $t('youHaveGroupPlan') }}
          tr(v-if='user.purchased.plan.extraMonths'): td
            span.glyphicon.glyphicon-credit-card
            | &nbsp; {{ $t('purchasedPlanExtraMonths', {purchasedPlanExtraMonthsDetails}) }}
          tr(v-if='hasConsecutiveSubscription'): td
            span.glyphicon.glyphicon-forward
            | &nbsp; {{ $t('consecutiveSubscription') }}
            ul.list-unstyled
              li {{ $t('consecutiveMonths') }} {{user.purchased.plan.consecutive.count + user.purchased.plan.consecutive.offset}}
              li {{ $t('gemCapExtra') }}} {{user.purchased.plan.consecutive.gemCapExtra}}
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
          .btn.btn-sm.btn-danger(v-if='canCancelSubscription', @click='cancelSubscription()') {{ $t('cancelSub') }}
          small(v-if='!canCancelSubscription', v-html='getCancelSubInfo()')

        .subscribe-pay(v-if='!hasSubscription || hasCanceledSubscription')
          h3 {{ $t('subscribeUsing') }}
          .row.text-center
            .col-md-4
              button.purchase.btn.btn-primary(@click='showStripe({subscription:subscription.key, coupon:subscription.coupon})', :disabled='!subscription.key') {{ $t('card') }}
            .col-md-4
              a.purchase(:href='paypalPurchaseLink', :disabled='!subscription.key', target='_blank')
                img(src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png', :alt="$t('paypal')")
            .col-md-4
              a.purchase(@click="amazonPaymentsInit({type: 'subscription', subscription:subscription.key, coupon:subscription.coupon})")
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
import encodeParams from 'client/libs/encodeParams';

import subscriptionBlocks from '../../../common/script/content/subscriptionBlocks';
import planGemLimits from '../../../common/script/libs/planGemLimits';
import amazonPaymentsModal from '../payments/amazonModal';
import paymentsMixin from '../../mixins/payments';

// TODO
const STRIPE_PUB_KEY = 'pk_test_6pRNASCoBOKtIshFeQd4XMUh';

export default {
  mixins: [paymentsMixin],
  components: {
    amazonPaymentsModal,
  },
  data () {
    return {
      gemCostTranslation: {
        gemCost: planGemLimits.convRate,
        gemLimit: planGemLimits.convRate,
      },
      subscription: {
        key: 'basic_earned',
      },
      amazonPayments: {},
      StripeCheckout: {},
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
  mounted () {
    this.StripeCheckout = window.StripeCheckout;
  },
  filters: {
    date (value) {
      if (!value) return '';
      return moment(value).formate(this.user.preferences.dateFormat);
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
    paypalPurchaseLink () {
      let couponString = '';
      if (this.subscription.coupon) couponString = `&coupon=${this.subscription.coupon}`;
      return `/paypal/subscribe?_id=${this.user._id}&apiToken=${this.user.apiToken}&sub=${this.subscription.key}${couponString}`;
    },
    subscriptionBlocksOrdered () {
      let subscriptions = filter(subscriptionBlocks, (o) => {
        return o.discount !== true;
      });

      return sortBy(subscriptions, [(o) => {
        return o.months;
      }]);
    },
    purchasedPlanIdInfo () {
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
        months: this.user.purchased.plan.extraMonths.toFixed(2),
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
  },
  methods: {
    async applyCoupon (coupon) {
      let response = await axios.get(`/api/v3/coupons/validate/${coupon}`);

      if (!response.data.valid) {
        //  Notification.error(env.t('invalidCoupon'), true);
        return;
      }

      //  Notification.text("Coupon applied!");
      let subs = subscriptionBlocks;
      subs.basic_6mo.discount = true;
      subs.google_6mo.discount = false;
    },
    showStripeEdit (config) {
      let groupId;
      if (config && config.groupId) {
        groupId = config.groupId;
      }

      this.StripeCheckout.open({
        key: STRIPE_PUB_KEY,
        address: false,
        name: this.$t('subUpdateTitle'),
        description: this.$t('subUpdateDescription'),
        panelLabel: this.$t('subUpdateCard'),
        token: async (data) => {
          data.groupId = groupId;
          let url = '/stripe/subscribe/edit';
          let response = await axios.post(url, data);

          // Succss
          window.location.reload(true);
          // error
          alert(response.message);
        },
      });
    },
    canCancelSubscription () {
      return (
        this.user.purchased.plan.paymentMethod !== this.paymentMethods.GOOGLE &&
        this.user.purchased.plan.paymentMethod !== this.paymentMethods.APPLE &&
        !this.hasCanceledSubscription &&
        !this.hasGroupPlan
      );
    },
    async cancelSubscription (config) {
      if (config && config.group && !confirm(this.$t('confirmCancelGroupPlan'))) return;
      if (!confirm(this.$t('sureCancelSub'))) return;

      let group;
      if (config && config.group) {
        group = config.group;
      }

      let paymentMethod = this.user.purchased.plan.paymentMethod;
      if (group) {
        paymentMethod = group.purchased.plan.paymentMethod;
      }

      if (paymentMethod === 'Amazon Payments') {
        paymentMethod = 'amazon';
      } else {
        paymentMethod = paymentMethod.toLowerCase();
      }

      let queryParams = {
        _id: this.user._id,
        apiToken: this.user.apiToken,
        noRedirect: true,
      };

      if (group) {
        queryParams.groupId = group._id;
      }

      let cancelUrl = `/${paymentMethod}/subscribe/cancel?${encodeParams(queryParams)}`;
      await axios.get(cancelUrl);
      //  Success
      alert(this.$t('paypalCanceled'));
      this.$router.push('/');
    },
    getCancelSubInfo () {
      return this.$t(`cancelSubInfo${this.user.purchased.plan.paymentMethod}`);
    },
    payPalPayment (data) {
      if (!this.checkGemAmount(data)) return;

      let gift = this.encodeGift(data.giftedTo, data.gift);
      let url = `/paypal/checkout?_id=${this.user._id}&apiToken=${this.user.apiToken}&gift=${gift}`;
      axios.get(url);
    },
    encodeGift (uuid, gift) {
      gift.uuid = uuid;
      let encodedString = JSON.stringify(gift);
      return encodeURIComponent(encodedString);
    },
  },
};
</script>
