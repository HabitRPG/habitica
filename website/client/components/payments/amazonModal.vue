<template lang="pug">
  b-modal#amazon-payment(title="Amazon", :hide-footer="true", size='lg')
    button#AmazonPayButton
    #AmazonPayWallet(v-if="amazonPayments.loggedIn", style="width: 400px; height: 228px;")
    #AmazonPayRecurring(v-if="amazonPayments.loggedIn && amazonPayments.type === 'subscription'",
                        style="width: 400px; height: 140px;")
    .modal-footer
      .btn.btn-primary(:disabled="amazonPaymentsCanCheckout() || !amazonButtonEnabled",
        @click="amazonCheckOut()") {{ $t('checkout') }}
</template>

<style scoped>
  #AmazonPayRecurring {
    height: 200px;
    width: 500px;
  }
</style>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

import bModal from 'bootstrap-vue/lib/components/modal';

const AMAZON_PAYMENTS = process.env.AMAZON_PAYMENTS; // eslint-disable-line

export default {
  components: {
    bModal,
  },
  props: ['amazonPayments'],
  data () {
    return {
      OffAmazonPayments: {},
      isAmazonReady: false,
      amazonButtonEnabled: false,
      amazonPaymentsbillingAgreementId: '',
      amazonPaymentspaymentSelected: false,
      amazonPaymentsrecurringConsent: 'false',
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  mounted () {
    // @TODO:
    // window.onAmazonLoginReady = function() {
    //   amazon.Login.setClientId('CLIENT-ID');
    // };
    // window.onAmazonPaymentsReady = function() {
    //             showButton();
    // };
    this.OffAmazonPayments = window.OffAmazonPayments;
    this.isAmazonReady = true;
    window.amazon.Login.setClientId(AMAZON_PAYMENTS.CLIENT_ID);


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
          this.amazonPaymentsbillingAgreementId = contract.getAmazonBillingAgreementId();

          if (this.amazonPayments.type === 'subscription') {
            this.amazonPayments.loggedIn = true;
            this.amazonPaymentsinitWidgets();
          } else {
            let url = '/amazon/createOrderReferenceId';
            let response = await axios.post(url, {
              billingAgreementId: this.amazonPaymentsbillingAgreementId,
            });

            // @TODO: Success
            this.amazonPayments.loggedIn = true;
            this.amazonPaymentsorderReferenceId = response.data.orderReferenceId;
            this.OffAmazonPayments.amazonPaymentsinitWidgets();
            // @TODO: error
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
  methods: {
    amazonPaymentsCanCheckout () {
      if (this.amazonPayments.type === 'single') {
        return this.amazonPaymentspaymentSelected === true;
      } else if (this.amazonPayments.type === 'subscription') {
        return this.amazonPaymentspaymentSelected === true &&
                // Mah.. one is a boolean the other a string...
                this.amazonPaymentsrecurringConsent === 'true';
      } else {
        return false;
      }
    },
    amazonInitWidgets () {
      let walletParams = {
        sellerId: AMAZON_PAYMENTS.SELLER_ID, // @TODO: Import
        design: {
          designMode: 'responsive',
        },

        onPaymentSelect: () => {
          this.amazonPaymentspaymentSelected = true;
        },

        onError: this.amazonOnError,
      };

      if (this.amazonPayments.type === 'subscription') {
        walletParams.agreementType = 'BillingAgreement';

        walletParams.billingAgreementId = this.amazonPaymentsbillingAgreementId;
        walletParams.onReady = (billingAgreement) => {
          this.amazonPaymentsbillingAgreementId = billingAgreement.getAmazonBillingAgreementId();

          new this.OffAmazonPayments.Widgets.Consent({
            sellerId: AMAZON_PAYMENTS.SELLER_ID,
            amazonBillingAgreementId: this.amazonPaymentsbillingAgreementId,
            design: {
              designMode: 'responsive',
            },

            onReady: (consent) => {
              let getConsent = consent.getConsentStatus;
              this.amazonPaymentsrecurringConsent = getConsent ? getConsent() : false;
            },

            onConsent: (consent) => {
              this.amazonPaymentsrecurringConsent = consent.getConsentStatus();
            },

            onError: this.amazonOnError,
          }).bind('AmazonPayRecurring');
        };
      } else {
        walletParams.amazonOrderReferenceId = this.amazonPaymentsorderReferenceId;
      }

      new this.OffAmazonPayments.Widgets.Wallet(walletParams).bind('AmazonPayWallet');
    },
    async amazonCheckOut () {
      this.amazonButtonEnabled = false;

      if (this.amazonPayments.type === 'single') {
        let url = '/amazon/checkout';
        let response = await axios.post(url, {
          orderReferenceId: this.amazonPaymentsorderReferenceId,
          gift: this.amazonPaymentsgift,
        });

        // Success
        this.amazonPaymentsreset();
        window.location.reload(true);

        // Failure
        alert(response.message);
        this.amazonPaymentsreset();
      } else if (this.amazonPayments.type === 'subscription') {
        let url = '/amazon/subscribe';

        if (this.amazonPayments.groupToCreate) {
          url = '/api/v3/groups/create-plan';
        }

        let response = await axios.post(url, {
          billingAgreementId: this.amazonPaymentsbillingAgreementId,
          subscription: this.amazonPayments.subscription,
          coupon: this.amazonPayments.coupon,
          groupId: this.amazonPayments.groupId,
          groupToCreate: this.amazonPayments.groupToCreate,
          paymentType: 'Amazon',
        });

        let responseStatus = response.status;
        if (responseStatus >= 400) {
          alert(`Error: ${response.message}`);
          // @TODO: do we need this? this.amazonPaymentsreset();
          return;
        }

        let newGroup = response.data.data;
        if (newGroup && newGroup._id) {
          // @TODO: Just append? or $emit?
          this.$router.push(`/group-plans/${newGroup._id}/task-information`);
          this.user.guilds.push(newGroup._id);
          return;
        }

        window.location.reload(true);
        this.amazonPaymentsreset();
      }
    },
    amazonPaymentsinitWidgets () {
      let walletParams = {
        sellerId: AMAZON_PAYMENTS.SELLER_ID,
        design: {
          designMode: 'responsive',
        },

        onPaymentSelect: () => {
          this.amazonPayments.paymentSelected = true;
        },

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
              this.amazonPayments.recurringConsent = getConsent ? getConsent() : false;
            },

            onConsent: (consent) => {
              this.amazonPayments.recurringConsent = consent.getConsentStatus();
            },

            onError: this.amazonOnError,
          }).bind('AmazonPayRecurring');
        };
      } else {
        walletParams.amazonOrderReferenceId = this.amazonPayments.orderReferenceId;
      }

      new this.OffAmazonPayments.Widgets.Wallet(walletParams).bind('AmazonPayWallet');
    },
    amazonOnError (error) {
      alert(error.getErrorMessage());
      // @TODO: this.amazonPaymentsreset();
    },
    reset () {
      this.amazonPaymentsmodal.close(); // @TODO:  this.$root.$emit('hide::modal', 'guild-form');
      this.amazonPaymentsmodal = null;
      this.amazonPayments.type = null;
      this.amazonPayments.loggedIn = false;
      this.amazonPaymentsgift = null;
      this.amazonPaymentsbillingAgreementId = null;
      this.amazonPaymentsorderReferenceId = null;
      this.amazonPaymentspaymentSelected = false;
      this.amazonPaymentsrecurringConsent = false;
      this.amazonPaymentssubscription = null;
      this.amazonPaymentscoupon = null;
    },
  },
};
</script>
