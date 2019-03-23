<template lang="pug">
  .amazon-pay-button(:id="buttonId")
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import uuid from 'uuid';
import paymentsMixin from 'client/mixins/payments';

const AMAZON_PAYMENTS = process.env.AMAZON_PAYMENTS; // eslint-disable-line

export default {
  mixins: [paymentsMixin],
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
  props: {
    amazonData: Object,
    amazonDisabled: {
      type: Boolean,
      default: false,
    },
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
  watch: {
    amazonData () {
      this.amazonPaymentsInit(this.amazonData);
    },
  },
  beforeMount () {
    this.buttonId = `AmazonPayButton-${uuid.v4()}`;
  },
  mounted () {
    this.amazonPaymentsInit(this.amazonData);
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
          size: 'large',
          agreementType: 'BillingAgreement',
          onSignIn: async (contract) => { // @TODO send to modal
            if (this.amazonDisabled === true) return null;
            // if (!this.checkGemAmount(this.amazonData)) return;
            this.amazonPayments.billingAgreementId = contract.getAmazonBillingAgreementId();

            this.$set(this.amazonPayments, 'loggedIn', true);

            this.$root.$emit('habitica::pay-with-amazon', this.amazonPayments);
          },
          authorization: () => {
            if (this.amazonDisabled === true) return null;
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
  },
};
</script>
