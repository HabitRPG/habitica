import axios from 'axios';

const STRIPE_PUB_KEY = process.env.STRIPE_PUB_KEY; // eslint-disable-line
import subscriptionBlocks from '../../common/script/content/subscriptionBlocks';

export default {
  methods: {
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

      this.StripeCheckout.open({
        key: STRIPE_PUB_KEY,
        address: false,
        amount,
        name: 'Habitica',
        description: sub ? this.$t('subscribe') : this.$t('checkout'),
        image: '/apple-touch-icon-144-precomposed.png',
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

          let responseStatus = response.status;
          if (responseStatus >= 400) {
            alert(`Error: ${response.message}`);
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
        },
      });
    },
    checkGemAmount (data) {
      let isGem = data && data.gift && data.gift.type === 'gems';
      let notEnoughGem = isGem && (!data.gift.gems.amount || data.gift.gems.amount === 0);
      if (notEnoughGem) {
        Notification.error(this.$t('badAmountOfGemsToPurchase'), true);
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

      this.$root.$emit('show::modal', 'amazon-payment');
    },
  },
};
