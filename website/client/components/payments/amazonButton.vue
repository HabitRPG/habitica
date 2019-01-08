<template lang="pug">
  // TODO what happens with multiple buttons on the page? Like settings + open gems modal, change id?
  .amazon-pay-button(:id="buttonId")
</template>

<style scoped>
  .amazon-pay-button {
    width: 150px;
    margin-bottom: 12px;
    margin: 0 auto;
  }
</style>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import uuid from 'uuid';

const AMAZON_PAYMENTS = process.env.AMAZON_PAYMENTS; // eslint-disable-line

export default {
  data () {
    return { // @TODO what needed here? can be moved to mixin?
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
      isAmazonSetup: false,
      amazonButtonEnabled: false,
      groupToCreate: null, // creating new group
      group: null, // upgrading existing group
      buttonId: null,
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
  beforeMount () {
    this.buttonId = `AmazonPayButton-${uuid.v4()}`;
  },
  mounted () {
    if (this.isAmazonReady) return this.setupAmazon();

    this.$store.watch(state => state.isAmazonReady, (isAmazonReady) => {
      if (isAmazonReady) return this.setupAmazon();
    });
  },
  methods: {
    setupAmazon () {
      if (this.isAmazonSetup) return false;
      this.isAmazonSetup = true;
      this.showButton();
    },
    showButton () {
      window.OffAmazonPayments.Button( // eslint-disable-line new-cap
        this.buttonId, // ID of the button
        AMAZON_PAYMENTS.SELLER_ID,
        {
          type: 'PwA',
          color: 'Gold',
          size: 'small',
          agreementType: 'BillingAgreement',
          onSignIn: async (contract) => { // @TODO send to modal
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

              const url = '/amazon/verifyAccessToken';
              axios.post(url, response).catch((e) => {
                alert(e.message);
              });
            });
          },
          onError: this.amazonOnError, // @TODO port here
        });
    },
    amazonOnError (error) {
      alert(error.getErrorMessage());
      this.reset();
    },
    reset () { // @TODO necessary for button?
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
