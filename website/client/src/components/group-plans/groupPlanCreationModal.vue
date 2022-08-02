<template>
  <b-modal
    id="group-plan-creation-modal"
    :title="activePage === PAGES.CREATE_GROUP ? 'Create your Group' : 'Select Payment'"
    :hide-footer="true"
    size="md"
    @hide="onHide()"
  >
    <div
      v-if="activePage === PAGES.CREATE_GROUP"
      class="col-12"
    >
      <div class="form-group">
        <label
          class="control-label"
          for="new-group-name"
        >Name</label>
        <input
          id="new-group-name"
          v-model="newGroup.name"
          class="form-control input-medium option-content"
          required="required"
          type="text"
          placeholder="Name"
        >
      </div>
      <div class="form-group">
        <label for="new-group-description">{{ $t('description') }}</label>
        <textarea
          id="new-group-description"
          v-model="newGroup.description"
          class="form-control option-content"
          cols="3"
          :placeholder="$t('description')"
        ></textarea>
      </div>
      <div
        v-if="type === 'guild'"
        class="form-group"
      >
        <div class="custom-control custom-radio">
          <input
            v-model="newGroup.privacy"
            class="custom-control-input"
            type="radio"
            name="new-group-privacy"
            value="private"
          >
          <label class="custom-control-label">{{ $t('inviteOnly') }}</label>
        </div>
      </div>
      <div class="form-group">
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
        v-if="type === 'party'"
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
      <div class="text-center">
        <payments-buttons
          :stripe-fn="() => pay(PAYMENTS.STRIPE)"
          :amazon-data="pay(PAYMENTS.AMAZON)"
        />
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
  .payment-options {
    margin-bottom: 4em;

    .purple-box {
      background-color: #4f2a93;
      color: #fff;
      padding: .5em;
      border-radius: 8px;
      width: 200px;
      height: 215px;

      .dollar {
      }

      .number {
        font-size: 60px;
      }

      .name {
        width: 100px;
        margin-left: .3em;
      }

      div {
        display: inline-block;
      }
    }

    .box, .purple-box {
      display: inline-block;
      vertical-align: bottom;
    }
  }
</style>

<script>
import paymentsMixin from '../../mixins/payments';
import { mapState } from '@/libs/store';
import paymentsButtons from '@/components/payments/buttons/list';

export default {
  components: {
    paymentsButtons,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
        // positiveIcon,
      }),
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      paymentMethod: '',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
      activePage: '',
      type: 'guild', // Guild or Party @TODO enum this
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
  },
  mounted () {
    console.log('i am mounted');
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
      const subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
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

      if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        return paymentData;
      }

      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.redirectToStripe(paymentData);
      }

      return null;
    },
  },
};
</script>
