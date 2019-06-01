import axios from 'axios';

const STRIPE_PUB_KEY = process.env.STRIPE_PUB_KEY; // eslint-disable-line no-process-env
import subscriptionBlocks from '../../common/script/content/subscriptionBlocks';
import { mapState } from 'client/libs/store';
import encodeParams from 'client/libs/encodeParams';
import notificationsMixin from 'client/mixins/notifications';
import * as Analytics from 'client/libs/analytics';
import { CONSTANTS, setLocalSetting } from 'client/libs/userlocalManager';
import pick from 'lodash/pick';
import moment from 'moment';

const habiticaUrl = `${location.protocol}//${location.host}`;

export default {
  mixins: [notificationsMixin],
  computed: {
    ...mapState({user: 'user.data', credentials: 'credentials'}),
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
      if (!this.user.preferences || !this.user.preferences.dateFormat) return this.user.purchased.plan.dateTerminated;
      return moment(this.user.purchased.plan.dateTerminated).format(this.user.preferences.dateFormat.toUpperCase());
    },
  },
  methods: {
    encodeGift (uuid, gift) {
      gift.uuid = uuid;
      let encodedString = JSON.stringify(gift);
      return encodeURIComponent(encodedString);
    },
    openPaypalGift (data) {
      if (!this.checkGemAmount(data)) return;

      let gift = this.encodeGift(data.giftedTo, data.gift);
      const url = `/paypal/checkout?gift=${gift}`;

      this.openPaypal(url, `gift-${data.gift.type === 'gems' ? 'gems' : 'subscription'}`, data);
    },
    openPaypal (url, type, giftData) {
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
    showStripe (data) {
      if (!this.checkGemAmount(data)) return;

      let sub = false;

      if (data.subscription) {
        sub = data.subscription;
      } else if (data.gift && data.gift.type === 'subscription') {
        sub = data.gift.subscription.key;
      }

      sub = sub && subscriptionBlocks[sub];

      let amount = 500; // 500 = $5
      if (sub) amount = sub.price * 100;
      if (data.gift && data.gift.type === 'gems') amount = data.gift.gems.amount / 4 * 100;
      if (data.group) amount = (sub.price + 3 * (data.group.memberCount - 1)) * 100;

      let paymentType;
      if (sub === false && !data.gift) paymentType = 'gems';
      if (sub !== false && !data.gift) paymentType = 'subscription';
      if (data.group || data.groupToCreate) paymentType = 'groupPlan';
      if (data.gift && data.gift.type === 'gems') paymentType = 'gift-gems';
      if (data.gift && data.gift.type === 'subscription') paymentType = 'gift-subscription';

      window.StripeCheckout.open({
        key: STRIPE_PUB_KEY,
        address: false,
        amount,
        name: 'Habitica',
        description: sub ? this.$t('subscribe') : this.$t('checkout'),
        // image: '/apple-touch-icon-144-precomposed.png',
        panelLabel: sub ? this.$t('subscribe') : this.$t('checkout'),
        token: async (res) => {
          let url = '/stripe/checkout?a=a'; // just so I can concat &x=x below

          if (data.groupToCreate) {
            url = '/api/v4/groups/create-plan?a=a';
            res.groupToCreate = data.groupToCreate;
            res.paymentType = 'Stripe';
          }

          if (data.gift) url += `&gift=${this.encodeGift(data.uuid, data.gift)}`;
          if (data.subscription) url += `&sub=${sub.key}`;
          if (data.coupon) url += `&coupon=${data.coupon}`;
          if (data.groupId) url += `&groupId=${data.groupId}`;

          let response = await axios.post(url, res);

          // @TODO handle with normal notifications?
          let responseStatus = response.status;
          if (responseStatus >= 400) {
            alert(`Error: ${response.message}`);
            return;
          }

          const appState = {
            paymentMethod: 'stripe',
            paymentCompleted: true,
            paymentType,
          };
          if (paymentType === 'subscription') {
            appState.subscriptionKey = sub.key;
          } else if (paymentType === 'groupPlan') {
            appState.subscriptionKey = sub.key;

            if (data.groupToCreate) {
              appState.newGroup = true;
              appState.group = pick(data.groupToCreate, ['_id', 'memberCount', 'name']);
            } else {
              appState.newGroup = false;
              appState.group = pick(data.group, ['_id', 'memberCount', 'name']);
            }
          } else if (paymentType.indexOf('gift-') === 0) {
            appState.gift = data.gift;
            appState.giftReceiver = data.receiverName;
          }


          setLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE, JSON.stringify(appState));

          let newGroup = response.data.data;
          if (newGroup && newGroup._id) {
            // @TODO this does not do anything as we reload just below
            // @TODO: Just append? or $emit?

            // Handle new user signup
            if (!this.$store.state.isUserLoggedIn) {
              Analytics.track({
                hitType: 'event',
                eventCategory: 'group-plans-static',
                eventAction: 'view',
                eventLabel: 'paid-with-stripe',
              });

              window.location.assign(`${habiticaUrl}/group-plans/${newGroup._id}/task-information?showGroupOverview=true`);
              return;
            }

            this.user.guilds.push(newGroup._id);
            window.location.assign(`${habiticaUrl}/group-plans/${newGroup._id}/task-information`);
            return;
          }

          if (data.groupId) {
            window.location.assign(`${habiticaUrl}/group-plans/${data.groupId}/task-information`);
            return;
          }

          window.location.reload(true);
        },
      });
    },
    showStripeEdit (config) {
      let groupId;
      if (config && config.groupId) {
        groupId = config.groupId;
      }

      window.StripeCheckout.open({
        key: STRIPE_PUB_KEY,
        address: false,
        name: this.$t('subUpdateTitle'),
        description: this.$t('subUpdateDescription'),
        panelLabel: this.$t('subUpdateCard'),
        token: async (data) => {
          data.groupId = groupId;
          let url = '/stripe/subscribe/edit';
          let response = await axios.post(url, data);

          // Success
          window.location.reload(true);
          // error
          alert(response.message);
        },
      });
    },
    checkGemAmount (data) {
      let isGem = data && data.gift && data.gift.type === 'gems';
      let notEnoughGem = isGem && (!data.gift.gems.amount || data.gift.gems.amount === 0);
      if (notEnoughGem) {
        this.error(this.$t('badAmountOfGemsToPurchase'), true);
        return false;
      }
      return true;
    },
    amazonPaymentsInit (data) {
      if (data.type !== 'single' && data.type !== 'subscription') return;

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

      this.amazonPayments.gift = data.gift;
      this.amazonPayments.type = data.type;
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
    cancelSubscriptionConfirm (config) {
      this.$root.$emit('habitica:cancel-subscription-confirm', config);
    },
    async cancelSubscription (config) {
      this.loading = true;

      let group;
      if (config && config.group) {
        group = config.group;
      }

      let paymentMethod = group ? group.purchased.plan.paymentMethod : this.user.purchased.plan.paymentMethod;
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
          await this.$store.dispatch('user:fetch', {forceLoad: true});
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
        alert(e.response.data.message);
      }
    },
  },
};
