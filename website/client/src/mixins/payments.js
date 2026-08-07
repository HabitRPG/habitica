import axios from 'axios'; // eslint-disable-line no-process-env
import pick from 'lodash/pick';
import moment from 'moment';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import { mapState } from '@/libs/store';
import encodeParams from '@/libs/encodeParams';
import notificationsMixin from '@/mixins/notifications';
import { CONSTANTS, setLocalSetting } from '@/libs/userlocalManager';

const { STRIPE_PUB_KEY } = import.meta.env;

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
        g1g1,
      } = data;
      let { url } = data;

      const appState = {
        paymentMethod: 'paypal',
        paymentCompleted: false,
        paymentType: type,
      };

      if (type === 'gift-subscription') {
        appState.g1g1 = g1g1;
      }

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
      if (paymentType === 'gift-subscription') {
        appState.g1g1 = data.g1g1;
      }
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
      paymentMethod = paymentMethod.toLowerCase();

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
    stripeGroup (options = { group: {}, upgrade: false }) {
      const paymentData = {
        subscription: 'group_monthly',
        coupon: null,
      };

      if (options.upgrade && options.group._id) {
        paymentData.groupId = options.group._id;
        paymentData.group = options.group;
      } else {
        paymentData.groupToCreate = options.group;
      }

      this.redirectToStripe(paymentData);
    },
  },
};
