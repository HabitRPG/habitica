<template>
  <b-modal
    id="create-group"
    :title="activePage === PAGES.CREATE_GROUP ? 'Create your Group' : 'Select Payment'"
    :hide-footer="true"
    :hide-header="true"
    size="md"
    @hide="onHide()"
  >
    <div
      v-if="activePage === PAGES.CREATE_GROUP"
      class="col-12"
    >
      <!-- HEADER -->
      <div
        class="modal-close"
      >
        <span
          class="cancel-text"
          @click="close()"
        >
          {{ $t('cancel') }}
        </span>
        <button
          class="btn btn-primary next-button"
          :value="$t('next')"
          :disabled="!newGroupIsReady"
          @click="close()"
        >
          {{ $t('next') }}
        </button>
      </div>
      <h2>{{ $t('createGroup') }}</h2>

      <!-- FORM -->
      <div class="form-group">
        <lockable-label
          :text="$t('nameStar')"
        />
        <input
          id="new-group-name"
          v-model="newGroup.name"
          class="form-control input-medium option-content name-input"
          required="required"
          type="text"
          :placeholder="$t('nameStarText')"
        >
      </div>
      <div class="form-group">
        <lockable-label
          for="new-group-description"
          :text="$t('descriptionOptional')"
        />
        <textarea
          id="new-group-description"
          v-model="newGroup.description"
          class="form-control option-content description-input"
          cols="3"
          :placeholder="$t('descriptionOptionalText')"
        ></textarea>
      </div>
<!--       <div
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
      </div> -->
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
      <div class="form-group">
        <lockable-label
          :text="$t('groupUse')"
        />
        <select-translated-array
          :items="[
            'groupParentChildren',
            'groupCouple',
            'groupFriends',
            'groupCoworkers',
            'groupManager',
            'groupTeacher'
          ]"
          class="group-input"
          :placeholder="'groupUseDefault'"
          :value="newGroup.demographics"
          @select="newGroup.demographics = $event"
        />
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
          class="btn btn-primary btn-lg btn-block btn-payment"
          :disabled="!newGroupIsReady"
          @click="createGroup()"
        >
          {{ $t('nextPaymentMethod') }}
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
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-300;
    font-size: 1.25rem;
    height: 28px;
    width: 120px;
    margin-top: 24px;
    align-self: center;
  }

  .cancel-text {
    color: $blue-10;
    font-size: 0.875rem;
    margin-right: 16px;
    text-align: center;
    cursor: pointer;
  }
  .next-button {
    align-self: center;
  }

  .form-control::placeholder {
    color: $gray-50;
    height: 32px;
  }

  .name-input, .description-input, .group-input {
    margin-top: -4px;
  }

  .description-input {
    height: 56px;
  }

  .spacer {
    margin-bottom: 16px !important;
  }

  .btn-payment {
    margin: 24px 112px 24px 112px;
    width: 177px;
  }

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
<style lang="scss">
  @import '~@/assets/scss/mixins.scss';
  #create-group {
    .modal-dialog {
      max-width: 448px;
    }
    .modal-content {
      width: 448px;
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 rgba(26, 24, 29, 0.24), 0 10px 10px 0 rgba(26, 24, 29, 0.28);
    }
    .modal-body{
      padding: 0px;
      margin-left: 12px;
      margin-right: 12px;
    }
    .modal-close {
      position: absolute;
      right: 16px;
      cursor: pointer;
      top: 0px;
    }
  }
</style>

<script>
import paymentsMixin from '../../mixins/payments';
import { mapState } from '@/libs/store';
import paymentsButtons from '@/components/payments/buttons/list';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';

export default {
  components: {
    paymentsButtons,
    selectTranslatedArray,
    lockableLabel,
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
      paymentMethod: '',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
        demographics: null,
      },
      activePage: 'create-group',
      type: 'guild', // Guild or Party @TODO enum this
      icons: Object.freeze({
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    newGroupIsReady () {
      return Boolean(this.newGroup.name) && Boolean(this.newGroup.demographics);
    },
  },
  mounted () {
    console.log('i am mounted');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'create-group');
    },
    changePage (page) {
      this.activePage = page;
    },
    createGroup () {
      console.log('i am giving habitica money now');
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
    onHide () {
      this.sendingInProgress = false;
    },
  },
};
</script>
