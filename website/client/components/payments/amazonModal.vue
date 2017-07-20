<template lang="pug">
  b-modal#amazon-payment(title="Amazon", :hide-footer="true", size='lg')
    button#AmazonPayButton
</template>

<script>
import axios from 'axios';

import bModal from 'bootstrap-vue/lib/components/modal';

const AMAZON_PAYMENTS = {
  CLIENT_ID: 'testing',
  SELLER_ID: 'test-seelllide',
};

export default {
  components: {
    bModal,
  },
  props: ['amazonPayments'],
  data () {
    return {
      OffAmazonPayments: {},
      isAmazonReady: false,
    };
  },
  mounted () {
    this.OffAmazonPayments = window.OffAmazonPayments;
    this.isAmazonReady = true;
    window.amazon.Login.setClientId(AMAZON_PAYMENTS.CLIENT_ID);

    // @TODO: prevent modal close form clicking outside
    this.OffAmazonPayments.Button('AmazonPayButton', AMAZON_PAYMENTS.SELLER_ID, { // eslint-disable-line
      type: 'PwA',
      color: 'Gold',
      size: 'small',
      agreementType: 'BillingAgreement',

      onSignIn: async (contract) => {
        this.amazonPaymentsbillingAgreementId = contract.getAmazonBillingAgreementId();

        if (this.amazonPaymentstype === 'subscription') {
          this.amazonPaymentsloggedIn = true;
          this.amazonPaymentsinitWidgets();
        } else {
          let url = '/amazon/createOrderReferenceId';
          let response = await axios.post(url, {
            billingAgreementId: this.amazonPaymentsbillingAgreementId,
          });

          // @TODO: Success
          this.amazonPaymentsloggedIn = true;
          this.amazonPaymentsorderReferenceId = response.data.orderReferenceId;
          this.amazonPaymentsinitWidgets();
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
      // if (this.amazonPaymentstype === 'single') {
      //   return this.amazonPaymentspaymentSelected === true;
      // } else if(this.amazonPaymentstype === 'subscription') {
      //   return this.amazonPaymentspaymentSelected === true &&
      //           // Mah.. one is a boolean the other a string...
      //           this.amazonPaymentsrecurringConsent === 'true';
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
          this.amazonPaymentspaymentSelected = true;
        },

        onError: this.amazonOnError,
      };

      if (this.amazonPaymentstype === 'subscription') {
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

      if (this.amazonPaymentstype === 'single') {
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
      } else if (this.amazonPaymentstype === 'subscription') {
        let url = '/amazon/subscribe';

        if (this.amazonPaymentsgroupToCreate) {
          url = '/api/v3/groups/create-plan';
        }

        let response = await axios.post(url, {
          billingAgreementId: this.amazonPaymentsbillingAgreementId,
          subscription: this.amazonPaymentssubscription,
          coupon: this.amazonPaymentscoupon,
          groupId: this.amazonPaymentsgroupId,
          groupToCreate: this.amazonPaymentsgroupToCreate,
          paymentType: 'Amazon',
        });

        // IF success
        this.amazonPaymentsreset();
        if (response && response.data && response.data._id) {
          this.$router.push(`/groups/guilds/${response.data._id}`);
        } else {
          this.$router.push('/');
        }

        // if fails
        alert(response.message);
        this.amazonPaymentsreset();
      }
    },
    amazonOnError (error) {
      alert(error.getErrorMessage());
      // @TODO: this.amazonPaymentsreset();
    },
    reset () {
      this.amazonPaymentsmodal.close(); // @TODO:  this.$root.$emit('hide::modal', 'guild-form');
      this.amazonPaymentsmodal = null;
      this.amazonPaymentstype = null;
      this.amazonPaymentsloggedIn = false;
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
