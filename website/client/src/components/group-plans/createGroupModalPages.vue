 <!-- THIS IS A VERY OLD FILE DO NOT USE -->
<template>
  <div class="create-group-modal-pages">
    <div
      v-if="activePage === PAGES.CREATE_GROUP"
      class="col-12"
    >
      <h2>{{ $t('nameYourGroup') }}</h2>
      <div class="form-group">
        <label
          class="control-label"
          for="new-group-name"
        >{{ $t('name') }}</label>
        <input
          id="new-group-name"
          v-model="newGroup.name"
          class="form-control input-medium option-content"
          required="required"
          type="text"
          :placeholder="$t('exampleGroupName')"
        >
      </div>
      <div class="form-group">
        <label for="new-group-description">{{ $t('description') }}</label>
        <textarea
          id="new-group-description"
          v-model="newGroup.description"
          class="form-control option-content"
          cols="3"
          :placeholder="$t('exampleGroupDesc')"
        ></textarea>
      </div>
      <div
        v-if="newGroup.type === 'guild'"
        class="form-group text-left"
      >
        <div class="custom-control custom-radio">
          <input
            v-model="newGroup.privacy"
            class="custom-control-input"
            type="radio"
            name="new-group-privacy"
            value="private"
          >
          <label class="custom-control-label">{{ $t('thisGroupInviteOnly') }}</label>
        </div>
      </div>
      <div class="form-group text-left">
        <div class="custom-control custom-checkbox">
          <input
            id="create-group-leaderOnlyChallenges-checkbox"
            v-model="newGroup.leaderOnly.challenges"
            class="custom-control-input"
            type="checkbox"
          >
          <label
            class="custom-control-label"
            for="create-group-leaderOnlyChallenges-checkbox"
          >{{ $t('leaderOnlyChallenges') }}</label>
        </div>
      </div>
      <div
        v-if="newGroup.type === 'party'"
        class="form-group"
      >
        <button
          class="btn btn-secondary form-control"
          :value="$t('create')"
          @click="createGroup()"
        ></button>
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary btn-lg btn-block"
          :disabled="!newGroupIsReady"
          @click="createGroup()"
        >
          {{ $t('create') }}
        </button>
      </div>
    </div>
    <div
      v-if="activePage === PAGES.PAY"
      class="col-12"
    >
      <h2>{{ $t('choosePaymentMethod') }}</h2>
      <payments-buttons
        :stripe-fn="() => pay(PAYMENTS.STRIPE)"
        :amazon-data="pay(PAYMENTS.AMAZON)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  h2 {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
    font-size: 29px;
    color: #34313a;
    margin-top: 1em;
  }

  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
    vertical-align: bottom;
    height: 100px;
    width: 306px;
    margin: 0 auto;
    margin-bottom: 1em;
  }

  .box .svg-icon {
    margin: 0 auto;
  }

  .form-group {
    text-align: left;
    font-weight: bold;
  }

  .custom-control-input {
    z-index: -1;
    opacity: 0;
  }

  .box:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  .btn-block {
    margin-bottom: 1em;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import paymentsMixin from '../../mixins/payments';
import paymentsButtons from '@/components/payments/buttons/list';

export default {
  components: {
    paymentsButtons,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      activePage: 'create-group',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
  },
  methods: {
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      const subscriptionKey = 'group_monthly';
      const paymentData = {
        subscription: subscriptionKey,
        coupon: null,
      };

      if (this.upgradingGroup && this.upgradingGroup._id) {
        paymentData.groupId = this.upgradingGroup._id;
        paymentData.group = this.upgradingGroup;
      } else {
        paymentData.groupToCreate = this.newGroup;
      }

      this.paymentMethod = paymentMethod;
      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.redirectToStripe(paymentData);
      } else if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        return paymentData;
      }

      return null;
    },
  },
};
</script>
