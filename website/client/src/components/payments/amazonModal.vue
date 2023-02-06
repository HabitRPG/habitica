<template>
  <b-modal
    id="amazon-payment"
    title="Amazon"
    size="md"
    :hide-footer="true"
    @hide="reset()"
  >
    <h2 class="text-center">
      Continue with Amazon
    </h2>
    <div
      v-if="amazonPayments.loggedIn"
      id="AmazonPayWallet"
      style="width: 400px; height: 228px;"
    ></div>
    <template v-if="amazonPayments.loggedIn && amazonPayments.type === 'subscription'">
      <br>
      <p v-html="$t('amazonPaymentsRecurring')"></p>
      <div
        id="AmazonPayRecurring"
        style="width: 400px; height: 140px;"
      ></div>
    </template>
    <div class="modal-footer">
      <div class="text-center">
        <button
          v-if="amazonPaymentsCanCheckout"
          class="btn btn-primary"
          :disabled="!amazonButtonEnabled"
          @click="amazonCheckOut()"
        >
          {{ $t('checkout') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  #AmazonPayButton {
    width: 150px;
    margin-bottom: 12px;
  }

  #AmazonPayWallet, #AmazonPayRecurring {
    margin: 0 auto;
  }

  #AmazonPayRecurring {
    height: 200px;
    width: 500px;
  }
</style>

<script>
import axios from 'axios';
import pick from 'lodash/pick';
import { mapState } from '@/libs/store';
import { CONSTANTS, setLocalSetting } from '@/libs/userlocalManager';
import paymentsMixin from '@/mixins/payments';

const habiticaUrl = `${window.location.protocol}//${window.location.host}`;

export default {
  mixins: [paymentsMixin],
  data () {
    return {
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
        sku: null,
      },
      isAmazonSetup: false,
      amazonButtonEnabled: false,
      groupToCreate: null, // creating new group
      group: null, // upgrading existing group
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
  mounted () {
    this.$root.$on('habitica::pay-with-amazon', amazonPaymentsData => {
      if (!amazonPaymentsData) return;

      const amazonPayments = {
        type: 'single',
        loggedIn: false,
      };
      this.amazonPayments = { ...amazonPayments, ...amazonPaymentsData };

      this.$root.$emit('bv::show::modal', 'amazon-payment');

      this.$nextTick(async () => {
        if (this.amazonPayments.type === 'subscription') {
          this.amazonInitWidgets();
        } else {
          const url = '/amazon/createOrderReferenceId';
          const response = await axios.post(url, {
            billingAgreementId: this.amazonPayments.billingAgreementId,
          });

          if (response.status <= 400) {
            this.amazonPayments.orderReferenceId = response.data.data.orderReferenceId;
            this.amazonInitWidgets();
          } else {
            window.alert(response.message); // eslint-disable-line no-alert
          }
        }
      });
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica::pay-with-amazon');
  },
  methods: {
    amazonInitWidgets () {
      const walletParams = {
        sellerId: process.env.AMAZON_PAYMENTS_SELLER_ID, // @TODO: Import
        design: {
          designMode: 'responsive',
        },
        onPaymentSelect: this.amazonOnPaymentSelect,
        onError: this.amazonOnError,
      };

      if (this.amazonPayments.type === 'subscription') {
        walletParams.agreementType = 'BillingAgreement';
        walletParams.billingAgreementId = this.amazonPayments.billingAgreementId;
        walletParams.onReady = billingAgreement => {
          this.amazonPayments.billingAgreementId = billingAgreement.getAmazonBillingAgreementId();

          new window.OffAmazonPayments.Widgets.Consent({
            sellerId: process.env.AMAZON_PAYMENTS_SELLER_ID,
            amazonBillingAgreementId: this.amazonPayments.billingAgreementId,
            design: {
              designMode: 'responsive',
            },
            onReady: consent => {
              this.$set(this.amazonPayments, 'recurringConsent', consent.getConsentStatus ? Boolean(consent.getConsentStatus()) : false);
              this.$set(this, 'amazonButtonEnabled', true);
            },
            onConsent: consent => {
              this.$set(this.amazonPayments, 'recurringConsent', Boolean(consent.getConsentStatus()));
            },
            onError: this.amazonOnError,
          }).bind('AmazonPayRecurring');
        };
      } else {
        this.$set(this, 'amazonButtonEnabled', true);
        walletParams.amazonOrderReferenceId = this.amazonPayments.orderReferenceId;
      }

      new window.OffAmazonPayments.Widgets.Wallet(walletParams).bind('AmazonPayWallet');
    },
    storePaymentStatusAndReload (url) {
      let paymentType;

      if (this.amazonPayments.type === 'single') {
        if (this.amazonPayments.sku) paymentType = 'sku';
        else if (!this.amazonPayments.gift) paymentType = 'gems';
      }
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
          appState.group = pick(this.amazonPayments.group, ['_id', 'memberCount', 'name', 'type']);
        }
      } else if (paymentType && paymentType.indexOf('gift-') === 0) {
        appState.gift = this.amazonPayments.gift;
        appState.giftReceiver = this.amazonPayments.giftReceiver;
      } else if (paymentType === 'gems') {
        appState.gemsBlock = this.amazonPayments.gemsBlock;
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
        const url = '/amazon/checkout';
        const data = {
          orderReferenceId: this.amazonPayments.orderReferenceId,
          gift: this.amazonPayments.gift,
          sku: this.amazonPayments.sku,
        };

        if (this.amazonPayments.gemsBlock) {
          data.gemsBlock = this.amazonPayments.gemsBlock.key;
        }

        try {
          await axios.post(url, data);

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

          const newGroup = response.data.data;
          if (newGroup && newGroup._id) {
            // Handle new user signup
            if (!this.$store.state.isUserLoggedIn) {
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
          this.$root.$emit('bv::hide::modal', 'amazon-payment');
          // @TODO: do we need this? this.amazonPaymentsreset();
        }
      }
    },
    amazonOnPaymentSelect () {
      this.$set(this.amazonPayments, 'paymentSelected', true);
    },
  },
};
</script>
