<template>
  <div
    :id="buttonId"
    class="amazon-pay-button"
    :class="{disabled}"
  ></div>
</template>

<script>
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { mapState } from '@/libs/store';
import paymentsMixin from '@/mixins/payments';

export default {
  mixins: [paymentsMixin],
  props: {
    amazonData: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return { // @TODO what needed here? can be moved to mixin?
      amazonPayments: {
        modal: null,
        type: null,
        gemsBlock: null,
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
    ...mapState(['isAmazonReady']),
    amazonPaymentsCanCheckout () {
      if (this.amazonPayments.type === 'single') {
        return this.amazonPayments.paymentSelected === true;
      } if (this.amazonPayments.type === 'subscription') {
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
    this.buttonId = `AmazonPayButton-${uuid()}`;
  },
  mounted () {
    this.amazonPaymentsInit(this.amazonData);
    if (this.isAmazonReady) return this.setupAmazon();

    return this.$store.watch(state => state.isAmazonReady, isAmazonReady => {
      if (isAmazonReady) return this.setupAmazon();
      return null;
    });
  },
  methods: {
    setupAmazon () {
      if (this.isAmazonSetup) return;
      this.isAmazonSetup = true;
      this.amazonLogout();
      this.showButton();
    },
    showButton () {
      window.OffAmazonPayments.Button( // eslint-disable-line new-cap
        this.buttonId, // ID of the button
        process.env.AMAZON_PAYMENTS_SELLER_ID,
        {
          type: 'PwA',
          color: 'Gold',
          size: 'large',
          agreementType: 'BillingAgreement',
          onSignIn: async contract => { // @TODO send to modal
            if (this.disabled === true) return null;
            // if (!this.checkGemAmount(this.amazonData)) return;
            this.amazonPayments.billingAgreementId = contract.getAmazonBillingAgreementId();

            this.$set(this.amazonPayments, 'loggedIn', true);

            return this.$root.$emit('habitica::pay-with-amazon', this.amazonPayments);
          },
          authorization: () => {
            if (this.disabled === true) return;

            window.amazon.Login.authorize({
              scope: 'payments:widget',
              popup: true,
            }, response => {
              if (response.error) return window.alert(response.error); // eslint-disable-line

              const url = '/amazon/verifyAccessToken';
              return axios.post(url, response).catch(e => {
                window.alert(e.message); // eslint-disable-line no-alert
              });
            });
          },
          onError: this.amazonOnError, // @TODO port here
        },
      );
    },
  },
};
</script>

<style lang="scss">
  .amazon-pay-button.disabled {
    .amazonpay-button-inner-image {
      cursor: default !important;

      &:focus {
        outline: none;
      }
    }
  }
</style>
