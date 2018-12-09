<template lang="pug">
  b-modal#amazon-payment(title="Amazon", :hide-footer="true", size='md')
    h2.text-center Continue with Amazon
    #AmazonPayButton
    #AmazonPayWallet(v-if="amazonPayments.loggedIn", style="width: 400px; height: 228px;")
    template(v-if="amazonPayments.loggedIn && amazonPayments.type === 'subscription'")
      br
      p(v-html="$t('amazonPaymentsRecurring')")
      #AmazonPayRecurring(style="width: 400px; height: 140px;")
    .modal-footer
      .text-center
        button.btn.btn-primary(v-if="amazonPaymentsCanCheckout",
          @click="amazonCheckOut()", :disabled='!amazonButtonEnabled') {{ $t('checkout') }}
</template>

<style scoped>
  #AmazonPayButton {
    width: 150px;
    margin-bottom: 12px;
  }

  #AmazonPayButton, #AmazonPayWallet, #AmazonPayRecurring {
    margin: 0 auto;
  }

  #AmazonPayRecurring {
    height: 200px;
    width: 500px;
  }
</style>

<script>
import * as Analytics from 'client/libs/analytics';
import axios from 'axios';
import { mapState } from 'client/libs/store';
import { CONSTANTS, setLocalSetting } from 'client/libs/userlocalManager';
import pick from 'lodash/pick';

const AMAZON_PAYMENTS = process.env.AMAZON_PAYMENTS; // eslint-disable-line
const habiticaUrl = `${location.protocol}//${location.host}`;

export default {
  data () {
    return {
      amazonPayments: {
        modal: null,
        type: null,
        gift: null,
        loggedIn: false,
        paymentSelected: false,
        billingAgreementId: '',
        recurringConsent: false,
        orderReferenceId: null,
        subscription: null,
        coupon: null,
      },
      OffAmazonPayments: {},
      isAmazonSetup: false,
      amazonButtonEnabled: false,
      groupToCreate: null, // creating new group
      group: null, // upgrading existing group
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    ...mapState(['isAmazonReady']),
    amazonPaymentsCanCheckout () {
      if (this.amazonPayments.type === 'single') {
        return this.amazonPayments.paymentSelected === true;
      } else if (this.amazonPayments.type === 'subscription') {
        return this.amazonPayments.paymentSelected && this.amazonPayments.recurringConsent;
      }
      return false;
    },
  },
  mounted () {
    if (this.isAmazonReady) return this.setupAmazon();

    this.$store.watch(state => state.isAmazonReady, (isAmazonReady) => {
      if (isAmazonReady) return this.setupAmazon();
    });

    this.$root.$on('habitica::pay-with-amazon', (amazonPaymentsData) => {
      if (!amazonPaymentsData) return;

      let amazonPayments = {
        type: 'single',
        loggedIn: false,
      };
      this.amazonPayments = Object.assign({}, amazonPayments, amazonPaymentsData);

      this.$root.$emit('bv::show::modal', 'amazon-payment');
    });
  },
  destroyed () {
    this.$root.$off('habitica::pay-with-amazon');
  },
  methods: {
    setupAmazon () {
      if (this.isAmazonSetup) return false;
      this.isAmazonSetup = true;
      this.OffAmazonPayments = window.OffAmazonPayments;
      this.showButton();
    },
    showButton () {
      // @TODO: prevent modal close form clicking outside
      let amazonButton = this.OffAmazonPayments.Button( // eslint-disable-line
        'AmazonPayButton',
        AMAZON_PAYMENTS.SELLER_ID,
        {
          type: 'PwA',
          color: 'Gold',
          size: 'small',
          agreementType: 'BillingAgreement',
          onSignIn: async (contract) => {
            this.amazonPayments.billingAgreementId = contract.getAmazonBillingAgreementId();

            this.$set(this.amazonPayments, 'loggedIn', true);

            if (this.amazonPayments.type === 'subscription') {
              this.amazonInitWidgets();
            } else {
              let url = '/amazon/createOrderReferenceId';
              let response = await axios.post(url, {
                billingAgreementId: this.amazonPayments.billingAgreementId,
              });

              if (response.status <= 400) {
                this.amazonPayments.orderReferenceId = response.data.data.orderReferenceId;
                this.amazonInitWidgets();
                return;
              }

              alert(response.message);
            }
          },
          authorization: () => {
            window.amazon.Login.authorize({
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
    },
    amazonInitWidgets () {
      let walletParams = {
        sellerId: AMAZON_PAYMENTS.SELLER_ID, // @TODO: Import
        design: {
          designMode: 'responsive',
        },
        onPaymentSelect: this.amazonOnPaymentSelect,
        onError: this.amazonOnError,
      };

      if (this.amazonPayments.type === 'subscription') {
        walletParams.agreementType = 'BillingAgreement';
        walletParams.billingAgreementId = this.amazonPayments.billingAgreementId;
        walletParams.onReady = (billingAgreement) => {
          this.amazonPayments.billingAgreementId = billingAgreement.getAmazonBillingAgreementId();

          new this.OffAmazonPayments.Widgets.Consent({
            sellerId: AMAZON_PAYMENTS.SELLER_ID,
            amazonBillingAgreementId: this.amazonPayments.billingAgreementId,
            design: {
              designMode: 'responsive',
            },
            onReady: (consent) => {
              let getConsent = consent.getConsentStatus;
              this.$set(this.amazonPayments, 'recurringConsent', getConsent ? Boolean(getConsent()) : false);
              this.$set(this, 'amazonButtonEnabled', true);
            },
            onConsent: (consent) => {
              this.$set(this.amazonPayments, 'recurringConsent', Boolean(consent.getConsentStatus()));
            },
            onError: this.amazonOnError,
          }).bind('AmazonPayRecurring');
        };
      } else {
        this.$set(this, 'amazonButtonEnabled', true);
        walletParams.amazonOrderReferenceId = this.amazonPayments.orderReferenceId;
      }

      new this.OffAmazonPayments.Widgets.Wallet(walletParams).bind('AmazonPayWallet');
    },
    storePaymentStatusAndReload (url) {
      let paymentType;

      if (this.amazonPayments.type === 'single' && !this.amazonPayments.gift) paymentType = 'gems';
      if (this.amazonPayments.type === 'subscription') paymentType = 'subscription';
      if (this.amazonPayments.groupId || this.amazonPayments.groupToCreate) paymentType = 'groupPlan';
      if (this.amazonPayments.type === 'single' && this.amazonPayments.gift && this.amazonPayments.giftReceiver) {
        paymentType = this.amazonPayments.gift.type === 'gems' ? 'gift-gems' : 'gift-subscription';
      }

      const appState = {
        paymentMethod: 'amazon',
        paymentCompleted: true,
        paymentType,
      };
      if (paymentType === 'subscription') {
        appState.subscriptionKey = this.amazonPayments.subscription;
      } else if (paymentType === 'groupPlan') {
        appState.subscriptionKey = this.amazonPayments.subscription;

        if (this.amazonPayments.groupToCreate) {
          appState.newGroup = true;
          appState.group = pick(this.amazonPayments.groupToCreate, ['_id', 'memberCount', 'name']);
        } else {
          appState.newGroup = false;
          appState.group = pick(this.amazonPayments.group, ['_id', 'memberCount', 'name']);
        }
      } else if (paymentType.indexOf('gift-') === 0) {
        appState.gift = this.amazonPayments.gift;
        appState.giftReceiver = this.amazonPayments.giftReceiver;
      }

      setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));
      if (url) {
        window.location.assign(url);
      } else {
        window.location.reload(true);
      }
    },
    async amazonCheckOut () {
      this.amazonButtonEnabled = false;

      // @TODO: Create factory functions
      // @TODO: A gift should not read the same as buying gems for yourself.
      if (this.amazonPayments.type === 'single') {
        let url = '/amazon/checkout';

        try {
          await axios.post(url, {
            orderReferenceId: this.amazonPayments.orderReferenceId,
            gift: this.amazonPayments.gift,
          });

          this.$set(this, 'amazonButtonEnabled', true);
          this.storePaymentStatusAndReload();
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
          this.$set(this, 'amazonButtonEnabled', true);
          this.reset();
        }
      } else if (this.amazonPayments.type === 'subscription') {
        let url = '/amazon/subscribe';

        if (this.amazonPayments.groupToCreate) {
          url = '/api/v4/groups/create-plan';
        }

        try {
          const response = await axios.post(url, {
            billingAgreementId: this.amazonPayments.billingAgreementId,
            subscription: this.amazonPayments.subscription,
            coupon: this.amazonPayments.coupon,
            groupId: this.amazonPayments.groupId,
            groupToCreate: this.amazonPayments.groupToCreate,
            paymentType: 'Amazon',
          });

          this.$root.$emit('bv::hide::modal', 'amazon-payment');

          let newGroup = response.data.data;
          if (newGroup && newGroup._id) {
            // Handle new user signup
            if (!this.$store.state.isUserLoggedIn) {
              Analytics.track({
                hitType: 'event',
                eventCategory: 'group-plans-static',
                eventAction: 'view',
                eventLabel: 'paid-with-amazon',
              });

              this.storePaymentStatusAndReload(`${habiticaUrl}/group-plans/${newGroup._id}/task-information?showGroupOverview=true`);
              return;
            }

            this.user.guilds.push(newGroup._id);
            this.storePaymentStatusAndReload(`${habiticaUrl}/group-plans/${newGroup._id}/task-information`);
            return;
          }

          if (this.amazonPayments.groupId) {
            this.storePaymentStatusAndReload(`${habiticaUrl}/group-plans/${this.amazonPayments.groupId}/task-information`);
            return;
          }

          this.storePaymentStatusAndReload();
        } catch (e) {
          this.$set(this, 'amazonButtonEnabled', true);
          // @TODO: do we need this? this.amazonPaymentsreset();
        }
      }
    },
    amazonOnPaymentSelect () {
      this.$set(this.amazonPayments, 'paymentSelected', true);
    },
    amazonOnError (error) {
      alert(error.getErrorMessage());
      this.reset();
    },
    reset () {
      // @TODO: Ensure we are using all of these
      // some vars are set in the payments mixin. We should try to edit in one place
      this.amazonPayments.modal = null;
      this.amazonPayments.type = null;
      this.amazonPayments.loggedIn = false;

      // Gift
      this.amazonPayments.gift = null;
      this.amazonPayments.giftReceiver = null;

      this.amazonPayments.billingAgreementId = null;
      this.amazonPayments.orderReferenceId = null;
      this.amazonPayments.paymentSelected = false;
      this.amazonPayments.recurringConsent = false;
      this.amazonPayments.subscription = null;
      this.amazonPayments.coupon = null;
      this.amazonPayments.groupToCreate = null;
      this.amazonPayments.group = null;
    },
  },
};
</script>
