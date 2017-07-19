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

import subscriptionBlocks from '../../../common/script/content/subscriptionBlocks';
import planGemLimits from '../../../common/script/libs/planGemLimits';

const STRIPE = 'stripe';
const APPLE = 'apple';
const GOOGLE = 'google';

// const paymentMethods = {
//   AMAZON_PAYMENTS: 'Amazon Payments',
//   STRIPE: 'Stripe',
//   GOOGLE: 'Google',
//   APPLE: 'Apple',
//   PAYPAL: 'Paypal',
//   GIFT: 'Gift',
// };

let amazonPayments = {};
amazonPayments.reset = () => {
  amazonPayments.modal.close();
  amazonPayments.modal = null;
  amazonPayments.type = null;
  amazonPayments.loggedIn = false;
  amazonPayments.gift = null;
  amazonPayments.billingAgreementId = null;
  amazonPayments.orderReferenceId = null;
  amazonPayments.paymentSelected = false;
  amazonPayments.recurringConsent = false;
  amazonPayments.subscription = null;
  amazonPayments.coupon = null;
};

const AMAZON_PAYMENTS = {
  CLIENT_ID: 'testing',
};
const STRIPE_PUB_KEY = '';

const StripeCheckout = {};
const amazon = {};

export default {
  data () {
    return {
      gemCostTranslation: {
        gemCost: planGemLimits.convRate,
        gemLimit: planGemLimits.convRate,
      },
      subscription: {
        key: 'basic_earned',
      },
      OffAmazonPayments: {},
      isAmazonReady: false,
    };
  },
  mounted () {
    this.OffAmazonPayments = window.OffAmazonPayments;
    this.isAmazonReady = true;
    window.amazon.Login.setClientId(AMAZON_PAYMENTS.CLIENT_ID);
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
        this.user.purchased.plan.paymentMethod === STRIPE
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
    showStripe (data) {
      return data; // @TODO: remove
      // if(!Payments.checkGemAmount(data)) return;
      //
      // let sub = false;
      //
      // if (data.subscription) {
      //   sub = data.subscription;
      // } else if (data.gift && data.gift.type=='subscription') {
      //   sub = data.gift.subscription.key;
      // }
      //
      // sub = sub && Content.subscriptionBlocks[sub];
      //
      // let amount = 500;// 500 = $5
      // if (sub) amount = sub.price * 100;
      // if (data.gift && data.gift.type=='gems') amount = data.gift.gems.amount / 4 * 100;
      // if (data.group) amount = (sub.price + 3 * (data.group.memberCount - 1)) * 100;
      //
      // StripeCheckout.open({
      //   key: window.env.STRIPE_PUB_KEY,
      //   address: false,
      //   amount: amount,
      //   name: 'Habitica',
      //   description: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      //   image: "/apple-touch-icon-144-precomposed.png",
      //   panelLabel: sub ? window.env.t('subscribe') : window.env.t('checkout'),
      //   token: function(res) {
      //     let url = '/stripe/checkout?a=a'; // just so I can concat &x=x below
      //
      //     if (data.groupToCreate) {
      //       url = '/api/v3/groups/create-plan?a=a';
      //       res.groupToCreate = data.groupToCreate;
      //       res.paymentType = 'Stripe';
      //     }
      //
      //     if (data.gift) url += '&gift=' + Payments.encodeGift(data.uuid, data.gift);
      //     if (data.subscription) url += '&sub='+sub.key;
      //     if (data.coupon) url += '&coupon='+data.coupon;
      //     if (data.groupId) url += '&groupId=' + data.groupId;
      //     $http.post(url, res).success(function(response) {
      //       if (response && response.data && response.data._id) {
      //         $rootScope.hardRedirect('/#/options/groups/guilds/' + response.data._id);
      //       } else {
      //         window.location.reload(true);
      //       }
      //     }).error(function(res) {
      //       alert(res.message);
      //     });
      //   }
      // });
    },
    showStripeEdit (config) {
      let groupId;
      if (config && config.groupId) {
        groupId = config.groupId;
      }

      StripeCheckout.open({
        key: STRIPE_PUB_KEY,
        address: false,
        name: window.env.t('subUpdateTitle'),
        description: window.env.t('subUpdateDescription'),
        panelLabel: window.env.t('subUpdateCard'),
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
        this.user.purchased.plan.paymentMethod !== GOOGLE &&
        this.user.purchased.plan.paymentMethod !== APPLE &&
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
        _id: this.user.user._id,
        apiToken: this.user .apiToken,
        noRedirect: true,
      };

      if (group) {
        queryParams.groupId = group._id;
      }

      let cancelUrl = `/${paymentMethod}/subscribe/cancel?${$.param(queryParams)}`;

      await axios.get(cancelUrl);
      // Succss
      alert(this.$t('paypalCanceled'));
      window.location.href = '/';
    },
    getCancelSubInfo () {
      return this.$t(`cancelSubInfo${this.user.purchased.plan.paymentMethod}`);
    },
    amazonPaymentsInit (data) {
      if (!this.isAmazonReady) return;
      if (!this.checkGemAmount(data)) return;
      if (data.type !== 'single' && data.type !== 'subscription') return;

      if (data.gift) {
        if (data.gift.gems && data.gift.gems.amount && data.gift.gems.amount <= 0) return;
        data.gift.uuid = data.giftedTo;
      }

      if (data.subscription) {
        amazonPayments.subscription = data.subscription;
        amazonPayments.coupon = data.coupon;
      }

      if (data.groupId) {
        amazonPayments.groupId = data.groupId;
      }

      if (data.groupToCreate) {
        amazonPayments.groupToCreate = data.groupToCreate;
      }

      amazonPayments.gift = data.gift;
      amazonPayments.type = data.type;

      // @TODO: modal
      // let modal = amazonPayments.modal = $rootScope.openModal('amazonPayments', {
      //   // Allow the modal to be closed only by pressing cancel
      //   // because no easy method to intercept those types of closings
      //   // and we need to make some cleanup
      //   keyboard: false,
      //   backdrop: 'static'
      // });
      // @TODO:
      let modal = {};
      modal.rendered.then(() => {
        this.OffAmazonPayments.button('AmazonPayButton', AMAZON_PAYMENTS.SELLER_ID, {
          type: 'PwA',
          color: 'Gold',
          size: 'small',
          agreementType: 'BillingAgreement',

          onSignIn: async (contract) => {
            amazonPayments.billingAgreementId = contract.getAmazonBillingAgreementId();

            if (amazonPayments.type === 'subscription') {
              amazonPayments.loggedIn = true;
              amazonPayments.initWidgets();
            } else {
              let url = '/amazon/createOrderReferenceId';
              let response = await axios.post(url, {
                billingAgreementId: amazonPayments.billingAgreementId,
              });

              // @TODO: Success
              amazonPayments.loggedIn = true;
              amazonPayments.orderReferenceId = response.data.orderReferenceId;
              amazonPayments.initWidgets();
              // @TODO: error
              alert(response.message);
            }
          },

          authorization: () => {
            amazon.Login.authorize({
              scope: 'payments:widget',
              popup: true,
            }, function amazonSuccess (response) {
              if (response.error) return alert(response.error);

              let url = '/amazon/verifyAccessToken';
              axios.post(url, response)
                .catch((e) => {
                  alert(e.message);
                });
            });
          },

          onError: this.amazonOnError,
        });
      });
    },
    amazonPaymentsCanCheckout () {
      // if (amazonPayments.type === 'single') {
      //   return amazonPayments.paymentSelected === true;
      // } else if(amazonPayments.type === 'subscription') {
      //   return amazonPayments.paymentSelected === true &&
      //           // Mah.. one is a boolean the other a string...
      //           amazonPayments.recurringConsent === 'true';
      // } else {
      //   return false;
      // }
    },
    amazonInitWidgets () {
      let walletParams = {
        sellerId: AMAZON_PAYMENTS.SELLER_ID, // @TODO: Import
        design: {
          designMode: 'responsive',
        },

        onPaymentSelect: () => {
          amazonPayments.paymentSelected = true;
        },

        onError: this.amazonOnError,
      };

      if (amazonPayments.type === 'subscription') {
        walletParams.agreementType = 'BillingAgreement';

        walletParams.billingAgreementId = amazonPayments.billingAgreementId;
        walletParams.onReady = (billingAgreement) => {
          amazonPayments.billingAgreementId = billingAgreement.getAmazonBillingAgreementId();

          new this.OffAmazonPayments.Widgets.Consent({
            sellerId: window.env.AMAZON_PAYMENTS.SELLER_ID,
            amazonBillingAgreementId: amazonPayments.billingAgreementId,
            design: {
              designMode: 'responsive',
            },

            onReady: (consent) => {
              let getConsent = consent.getConsentStatus;
              amazonPayments.recurringConsent = getConsent ? getConsent() : false;
            },

            onConsent: (consent) => {
              amazonPayments.recurringConsent = consent.getConsentStatus();
            },

            onError: this.amazonOnError,
          }).bind('AmazonPayRecurring');
        };
      } else {
        walletParams.amazonOrderReferenceId = amazonPayments.orderReferenceId;
      }

      new this.OffAmazonPayments.Widgets.Wallet(walletParams).bind('AmazonPayWallet');
    },
    async amazonCheckOut () {
      this.amazonButtonEnabled = false;

      if (amazonPayments.type === 'single') {
        let url = '/amazon/checkout';
        let response = await axios.post(url, {
          orderReferenceId: amazonPayments.orderReferenceId,
          gift: amazonPayments.gift,
        });

        // Success
        amazonPayments.reset();
        window.location.reload(true);

        // Failure
        alert(response.message);
        amazonPayments.reset();
      } else if (amazonPayments.type === 'subscription') {
        let url = '/amazon/subscribe';

        if (amazonPayments.groupToCreate) {
          url = '/api/v3/groups/create-plan';
        }

        let response = await axios.post(url, {
          billingAgreementId: amazonPayments.billingAgreementId,
          subscription: amazonPayments.subscription,
          coupon: amazonPayments.coupon,
          groupId: amazonPayments.groupId,
          groupToCreate: amazonPayments.groupToCreate,
          paymentType: 'Amazon',
        });

        // IF success
        amazonPayments.reset();
        if (response && response.data && response.data._id) {
          this.$router.push(`/groups/guilds/${response.data._id}`);
        } else {
          this.$router.push('/');
        }

        // if fails
        alert(response.message);
        amazonPayments.reset();
      }
    },
    amazonOnError (error) {
      alert(error.getErrorMessage());
      amazonPayments.reset();
    },
    async cancelSubscription (config) {
      if (config && config.group && !confirm(window.env.t('confirmCancelGroupPlan'))) return;
      if (!confirm(window.env.t('sureCancelSub'))) return;

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

      let cancelUrl = `/${paymentMethod}/subscribe/cancel?${$.param(queryParams)}`;
      await axios.get(cancelUrl);

      alert(this.$t('paypalCanceled'));
      this.$router.push('/');
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
    checkGemAmount (data) {
      let isGem = data && data.gift && data.gift.type === 'gems';
      let notEnoughGem = isGem && (!data.gift.gems.amount || data.gift.gems.amount === 0);
      if (notEnoughGem) {
        Notification.error(window.env.t('badAmountOfGemsToPurchase'), true);
        return false;
      }
      return true;
    },
  },
};
</script>
