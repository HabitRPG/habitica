import axios from 'axios';

const STRIPE_PUB_KEY = process.env.STRIPE_PUB_KEY; // eslint-disable-line
import subscriptionBlocks from '../../common/script/content/subscriptionBlocks';
import { mapState } from 'client/libs/store';
import encodeParams from 'client/libs/encodeParams';
import notificationsMixin from 'client/mixins/notifications';

export default {
  mixins: [notificationsMixin],
  computed: {
    ...mapState(['credentials']),
    // @TODO refactor into one single computed property
    paypalCheckoutLink () {
      return `/paypal/checkout?_id=${this.credentials.API_ID}&apiToken=${this.credentials.API_TOKEN}`;
    },
    paypalSubscriptionLink () {
      return `/paypal/subscribe?_id=${this.credentials.API_ID}&apiToken=${this.credentials.API_TOKEN}&sub=${this.subscriptionPlan}`;
    },
    paypalPurchaseLink () {
      if (!this.subscription) {
        this.subscription = {
          key: 'basic_earned',
        };
      }
      let couponString = '';
      if (this.subscription.coupon) couponString = `&coupon=${this.subscription.coupon}`;
      return `/paypal/subscribe?_id=${this.credentials.API_ID}&apiToken=${this.credentials.API_TOKEN}&sub=${this.subscription.key}${couponString}`;
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
      const url = `/paypal/checkout?_id=${this.credentials.API_ID}&apiToken=${this.credentials.API_TOKEN}&gift=${gift}`;

      window.open(url, '_blank');
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

      let amount = 500;// 500 = $5
      if (sub) amount = sub.price * 100;
      if (data.gift && data.gift.type === 'gems') amount = data.gift.gems.amount / 4 * 100;
      if (data.group) amount = (sub.price + 3 * (data.group.memberCount - 1)) * 100;

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
            url = '/api/v3/groups/create-plan?a=a';
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

          let newGroup = response.data.data;
          if (newGroup && newGroup._id) {
            // @TODO this does not do anything as we reload just below
            // @TODO: Just append? or $emit?
            this.$router.push(`/group-plans/${newGroup._id}/task-information`);
            // @TODO action
            this.user.guilds.push(newGroup._id);
            return;
          }

          if (data.groupId) {
            this.$router.push(`/group-plans/${data.groupId}/task-information`);
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

          // Succss
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
      // @TODO: Do we need this? if (!this.isAmazonReady) return;
      if (!this.checkGemAmount(data)) return;
      if (data.type !== 'single' && data.type !== 'subscription') return;

      if (data.gift) {
        if (data.gift.gems && data.gift.gems.amount && data.gift.gems.amount <= 0) return;
        data.gift.uuid = data.giftedTo;
      }

      if (data.subscription) {
        this.amazonPayments.subscription = data.subscription;
        this.amazonPayments.coupon = data.coupon;
      }

      if (data.groupId) {
        this.amazonPayments.groupId = data.groupId;
      }

      if (data.groupToCreate) {
        this.amazonPayments.groupToCreate = data.groupToCreate;
      }

      this.amazonPayments.gift = data.gift;
      this.amazonPayments.type = data.type;

      this.$root.$emit('habitica::pay-with-amazon', this.amazonPayments);
    },
    async cancelSubscription (config) {
      if (config && config.group && !confirm(this.$t('confirmCancelGroupPlan'))) return;
      if (!confirm(this.$t('sureCancelSub'))) return;

      this.loading = true;

      let group;
      if (config && config.group) {
        group = config.group;
      }

      let paymentMethod = this.user.purchased.plan.paymentMethod;
      if (group) {
        paymentMethod = group.purchased.plan.paymentMethod;
      }

      if (paymentMethod === 'Amazon Payments') {
        paymentMethod = 'amazon';
      } else {
        paymentMethod = paymentMethod.toLowerCase();
      }

      let queryParams = {
        _id: this.user._id,
        apiToken: this.credentials.API_TOKEN,
        noRedirect: true,
      };

      if (group) {
        queryParams.groupId = group._id;
      }

      let cancelUrl = `/${paymentMethod}/subscribe/cancel?${encodeParams(queryParams)}`;
      await axios.get(cancelUrl);

      this.loading = false;

      //  Success
      alert(this.$t('paypalCanceled'));
      this.$router.push('/');
    },
  },
};
