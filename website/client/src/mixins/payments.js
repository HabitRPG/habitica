import axios from 'axios'; // eslint-disable-line no-process-env
import pick from 'lodash/pick';
import moment from 'moment';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import { mapState } from '@/libs/store';
import encodeParams from '@/libs/encodeParams';
import notificationsMixin from '@/mixins/notifications';
import { CONSTANTS, setLocalSetting } from '@/libs/userlocalManager';

const { STRIPE_PUB_KEY } = process.env;

let stripeInstance = null;

export default {
  mixins: [notificationsMixin],
  computed: {
    ...mapState({ user: 'user.data', credentials: 'credentials' }),
    paypalCheckoutLink () {
      return '/paypal/checkout';
    },
    paypalSubscriptionLink () {
      return `/paypal/subscribe?sub=${this.subscriptionPlan}`;
    },
    paypalPurchaseLink () {
      if (!this.subscription) {
        this.subscription = {
          key: 'basic_earned',
        };
      }
      let couponString = '';
      if (this.subscription.coupon) couponString = `&coupon=${this.subscription.coupon}`;
      return `/paypal/subscribe?sub=${this.subscription.key}${couponString}`;
    },
    dateTerminated () {
      if (!this.user.preferences || !this.user.preferences.dateFormat) {
        return this.user.purchased.plan.dateTerminated;
      }
      return moment(this.user.purchased.plan.dateTerminated)
        .format(this.user.preferences.dateFormat.toUpperCase());
    },
    renewalDate () {
      const renewalDate = moment().add(1, 'months');
      if (!this.user.preferences || !this.user.preferences.dateFormat) {
        return renewalDate;
      }
      return renewalDate.format(this.user.preferences.dateFormat.toUpperCase());
    },
  },
  methods: {
    encodeGift (uuid, gift) {
      gift.uuid = uuid;
      const encodedString = JSON.stringify(gift);
      return encodeURIComponent(encodedString);
    },
    openPaypalGift (giftData) {
      if (!this.checkGemAmount(giftData)) return;

      const gift = this.encodeGift(giftData.giftedTo, giftData.gift);
      const url = `/paypal/checkout?gift=${gift}`;

      this.openPaypal({
        url,
        type: `gift-${giftData.gift.type === 'gems' ? 'gems' : 'subscription'}`,
        giftData,
      });
    },
    openPaypal (data = {}) {
      const {
        type,
        giftData,
        gemsBlock,
        sku,
      } = data;
      let { url } = data;

      const appState = {
        paymentMethod: 'paypal',
        paymentCompleted: false,
        paymentType: type,
      };

      if (type === 'subscription') {
        appState.subscriptionKey = this.subscriptionPlan || this.subscription.key;
      }

      if (type.indexOf('gift-') === 0) {
        appState.gift = giftData.gift;
        appState.giftReceiver = giftData.receiverName;
      }

      if (type === 'gems') {
        appState.gemsBlock = gemsBlock;
        url += `?gemsBlock=${gemsBlock.key}`;
      }

      if (type === 'sku') {
        appState.sku = sku;
        url += `?sku=${sku}`;
      }

      setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));
      window.open(url, '_blank');

      function localStorageChangeHandled (e) {
        if (e.key === 'saved-app-state') {
          window.removeEventListener('storage', localStorageChangeHandled);
          const newState = e.newValue ? JSON.parse(e.newValue) : {};
          if (newState.paymentCompleted) window.location.reload(true);
        }
      }

      // Listen for changes to local storage, indicating that the payment completed
      window.addEventListener('storage', localStorageChangeHandled);
    },
    async redirectToStripe (data) {
      if (!stripeInstance) {
        stripeInstance = window.Stripe(STRIPE_PUB_KEY);
      }
      if (!this.checkGemAmount(data)) return;

      let sub = false;

      if (data.subscription) {
        sub = data.subscription;
      } else if (data.gift && data.gift.type === 'subscription') {
        sub = data.gift.subscription.key;
      }

      sub = sub && subscriptionBlocks[sub];

      let paymentType;
      if (sub === false && !data.gift) paymentType = 'gems';
      if (sub !== false && !data.gift) paymentType = 'subscription';
      if (data.group || data.groupToCreate) paymentType = 'groupPlan';
      if (data.gift && data.gift.type === 'gems') paymentType = 'gift-gems';
      if (data.gift && data.gift.type === 'subscription') paymentType = 'gift-subscription';
      if (data.sku) paymentType = 'sku';

      let url = '/stripe/checkout-session';
      const postData = {};

      if (data.groupToCreate) {
        url = '/api/v4/groups/create-plan';
        postData.groupToCreate = data.groupToCreate;
        postData.paymentType = 'Stripe';
      }

      if (data.gemsBlock) postData.gemsBlock = data.gemsBlock.key;
      if (data.gift) {
        data.gift.uuid = data.uuid;
        postData.gift = data.gift;
      }
      if (data.subscription) postData.sub = sub.key;
      if (data.coupon) postData.coupon = data.coupon;
      if (data.groupId) postData.groupId = data.groupId;
      if (data.demographics) postData.demographics = data.demographics;
      if (data.sku) postData.sku = data.sku;

      const response = await axios.post(url, postData);

      const appState = {
        paymentMethod: 'stripe',
        paymentCompleted: false,
        paymentType,
      };
      if (paymentType === 'subscription') {
        appState.subscriptionKey = sub.key;
      } else if (paymentType === 'groupPlan') {
        appState.subscriptionKey = sub.key;

        // Handle new user signup
        if (!this.$store.state.isUserLoggedIn) {
          appState.newSignup = true;
        }

        if (data.groupToCreate) {
          appState.newGroup = true;
          appState.group = pick(response.data.data.group, ['_id', 'memberCount', 'name', 'type']);
        } else {
          appState.newGroup = false;
          appState.group = pick(data.group, ['_id', 'memberCount', 'name', 'type']);
        }
      } else if (paymentType.indexOf('gift-') === 0) {
        appState.gift = data.gift;
        appState.giftReceiver = data.receiverName;
      } else if (paymentType === 'gems') {
        appState.gemsBlock = data.gemsBlock;
      }

      setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));

      try {
        const checkoutSessionResult = await stripeInstance.redirectToCheckout({
          sessionId: response.data.data.sessionId,
        });
        if (checkoutSessionResult.error) {
          console.error(checkoutSessionResult.error); // eslint-disable-line
          alert(`Error while redirecting to Stripe: ${checkoutSessionResult.error.message}`);
          throw checkoutSessionResult.error;
        }
      } catch (err) {
        console.error('Error while redirecting to Stripe', err); // eslint-disable-line
        alert(`Error while redirecting to Stripe: ${err.message}`);
        throw err;
      }
    },
    async redirectToStripeEdit (config) {
      if (!stripeInstance) {
        stripeInstance = window.Stripe(STRIPE_PUB_KEY);
      }

      let groupId;
      if (config && config.groupId) {
        groupId = config.groupId;
      }

      const appState = {
        paymentMethod: 'stripe',
        isStripeEdit: true,
        paymentCompleted: false,
        paymentType: groupId ? 'groupPlan' : 'subscription',
        groupId,
      };

      const response = await axios.post('/stripe/subscribe/edit', {
        groupId,
      });

      setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));

      try {
        const checkoutSessionResult = await stripeInstance.redirectToCheckout({
          sessionId: response.data.data.sessionId,
        });
        if (checkoutSessionResult.error) {
          console.error(checkoutSessionResult.error); // eslint-disable-line
          alert(`Error while redirecting to Stripe: ${checkoutSessionResult.error.message}`);
          throw checkoutSessionResult.error;
        }
      } catch (err) {
        console.error('Error while redirecting to Stripe', err); // eslint-disable-line
        alert(`Error while redirecting to Stripe: ${err.message}`);
        throw err;
      }
    },
    checkGemAmount (data) {
      const isGem = data && data.gift && data.gift.type === 'gems';
      const notEnoughGem = isGem && (!data.gift.gems.amount || data.gift.gems.amount === 0);
      if (notEnoughGem) {
        this.error(this.$t('badAmountOfGemsToPurchase'), true);
        return false;
      }
      return true;
    },
    amazonPaymentsInit (data) {
      if (data.type !== 'single' && data.type !== 'subscription') return;

      if (data.type === 'single') {
        this.amazonPayments.gemsBlock = data.gemsBlock;
        this.amazonPayments.sku = data.sku;
      }

      if (data.gift) {
        if (data.gift.gems && data.gift.gems.amount && data.gift.gems.amount <= 0) return;
        data.gift.uuid = data.giftedTo;
        this.amazonPayments.giftReceiver = data.receiverName;
      }

      if (data.subscription) {
        this.amazonPayments.subscription = data.subscription;
        this.amazonPayments.coupon = data.coupon;
      }

      if (data.groupId) {
        this.amazonPayments.groupId = data.groupId;
      }

      if (data.group) { // upgrading a group
        this.amazonPayments.group = data.group;
      }

      if (data.groupToCreate) { // creating a group
        this.amazonPayments.groupToCreate = data.groupToCreate;
      }

      if (data.demographics) { // sending demographics
        this.amazonPayments.demographics = data.demographics;
      }

      this.amazonPayments.gift = data.gift;
      this.amazonPayments.type = data.type;
    },
    amazonOnError (error) {
      window.alert(error.getErrorMessage()); // eslint-disable-line no-alert
      this.reset();
    },
    // Make sure the amazon session is reset between different sessions and after each purchase
    amazonLogout () {
      if (window.amazon && window.amazon.Login && typeof window.amazon.Login.logout === 'function') {
        window.amazon.Login.logout();
      }
    },
    reset () {
      // @TODO: Ensure we are using all of these
      // some vars are set in the payments mixin. We should try to edit in one place
      this.amazonLogout();

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
    cancelSubscriptionConfirm (config) {
      if (config.canCancel === false) return;
      this.$root.$emit('habitica:cancel-subscription-confirm', config);
    },
    async cancelSubscription (config) {
      this.loading = true;

      let group;
      if (config && config.group) {
        group = config.group;
      }

      let paymentMethod = group
        ? group.purchased.plan.paymentMethod
        : this.user.purchased.plan.paymentMethod;
      paymentMethod = paymentMethod === 'Amazon Payments' ? 'amazon' : paymentMethod.toLowerCase();

      const queryParams = {
        noRedirect: true,
      };

      if (group) {
        queryParams.groupId = group._id;
      }

      try {
        const cancelUrl = `/${paymentMethod}/subscribe/cancel?${encodeParams(queryParams)}`;
        await axios.get(cancelUrl);

        if (!config || !config.group) {
          await this.$store.dispatch('user:fetch', { forceLoad: true });
          this.$root.$emit('habitica:subscription-canceled', {
            dateTerminated: this.dateTerminated,
            isGroup: false,
          });
        } else {
          const appState = {
            groupPlanCanceled: true,
          };
          setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));
          window.location.reload(true);
        }

        this.loading = false;
      } catch (e) {
        window.alert(e.response.data.message); // eslint-disable-line no-alert
      }
    },
  },
};
