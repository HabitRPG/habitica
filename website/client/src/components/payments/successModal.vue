<template>
  <b-modal
    id="payments-success-modal"
    :title="$t('accountSuspendedTitle')"
    :hide-footer="isFromBalance || paymentData.newGroup"
    :modal-class="isFromBalance || paymentData.newGroup ? ['modal-hidden-footer'] : []"
  >
    <div slot="modal-header">
      <div class="check-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon check"
          v-html="icons.check"
        ></div>
      </div>
      <h2>{{ $t(isFromBalance ? 'success' : 'paymentSuccessful') }}</h2>
    </div>
    <div slot="modal-footer">
      <!-- everyone else -->
      <div
        v-if="paymentData.paymentType !== 'groupPlan' || paymentData.newGroup"
        class="small-text"
      >
        {{ $t('giftSubscriptionText4') }}
      </div>
      <!-- upgradedGroup -->
      <div
        v-else
        class="demographics d-flex flex-column justify-content-center"
      >
        <lockable-label
          :text="$t('groupUse')"
          class="mx-auto label-text"
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
          :value="groupPlanUpgraded.demographics"
          @select="groupPlanUpgraded.demographics = $event"
        />
        <button
          v-if="!paymentData.newGroup"
          class="btn btn-primary mx-auto"
          :disabled="!groupPlanUpgraded.demographics"
          @click="submit()"
        >
          {{ $t('submit') }}
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 modal-body-col">
        <!-- buy gems for self -->
        <template v-if="paymentData.paymentType === 'gems'">
          <strong v-once>{{ $t('paymentYouReceived') }}</strong>
          <div class="details-block gems">
            <div
              v-once
              class="svg-icon"
              v-html="icons.gem"
            ></div>
            <span>{{ paymentData.gemsBlock.gems }}</span>
          </div>
        </template>
        <!-- buy or gift gems to someone else -->
        <template
          v-if="paymentData.paymentType === 'gift-gems'
            || paymentData.paymentType === 'gift-gems-balance'"
        >
          <span v-html="$t('paymentYouSentGems', {name: paymentData.giftReceiver})"></span>
          <div class="details-block gems">
            <div
              v-once
              class="svg-icon"
              v-html="icons.gem"
            ></div>
            <span>{{ paymentData.gift.gems.amount }}</span>
          </div>
        </template>
        <!-- give gift subscription (non-recurring)-->
        <template v-if="paymentData.paymentType === 'gift-subscription'">
          <span
            v-html="$t('paymentYouSentSubscription', {
              name: paymentData.giftReceiver, months: paymentData.subscription.months})"
          ></span>
        </template>
        <!-- buy self subscription (recurring) -->
        <template v-if="paymentData.paymentType === 'subscription'">
          <strong v-once>{{ $t('nowSubscribed') }}</strong>
          <div class="details-block">
            <span
              v-html="$t('paymentSubBilling', {
                amount: paymentData.subscription.price, months: paymentData.subscription.months})"
            ></span>
          </div>
        </template>
        <!-- group plan new or upgraded -->
        <template v-if="paymentData.paymentType === 'groupPlan'">
          <span
            v-html="$t(paymentData.newGroup
              ? 'groupPlanCreated' : 'groupPlanUpgraded', {groupName: paymentData.group.name})"
          ></span>
          <div
            v-if="!paymentData.newGroup || paymentData.newGroup"
            class=""
          >
            <div class="details-block group-billing-date">
              <span
                v-html="$t('groupsPaymentSubBilling', { renewalDate })"
              >
              </span>
            </div>
            <div class="small-text group-auto-renew">
              <span
                v-once
              >{{ $t('groupsPaymentAutoRenew') }}
              </span>
            </div>
          </div>
        </template>
        <!-- buy self subscription auto renew -->
        <template
          v-if="paymentData.paymentType === 'subscription'"
        >
          <span
            v-once
            class="small-text auto-renew"
          >{{ $t('paymentAutoRenew') }}</span>
        </template>
        <!-- buttons for subscriptions -->
        <button
          v-if="paymentData.paymentType !== 'groupPlan'"
          v-once
          class="btn btn-primary"
          @click="onwards()"
        >
          {{ $t('onwards') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

#payments-success-modal .modal-md {
  max-width: 448px;
}

#payments-success-modal .modal-content {
  background: transparent;
}

#payments-success-modal.modal-hidden-footer .modal-body {
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}


#payments-success-modal .modal-header {
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 0px;
  background: $green-100;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom: none;

  h2 {
    color: $green-1;
  }

  .check-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: $green-1;
    margin: 0 auto;
    margin-bottom: 16px;
  }

  .check {
    width: 35.1px;
    height: 28px;
    color: $white;
  }
}

#payments-success-modal .modal-body {
  padding: 16px 32px 24px 32px;
  background: $white;

  .modal-body-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .btn.btn-primary {
      margin-top: 24px;
    }
  }

  .details-block {
    background: $gray-700;
    border-radius: 4px;
    padding: 8px 16px;
    margin-top: 16px;
    display: inline-flex;
    flex-direction: row;
    text-align: center;

    &.gems {
      padding: 12px 16px 12px 20px;
      color: $green-10;
      font-size: 24px;
      font-weight: bold;
      line-height: 1.33;

      .svg-icon {
        margin-right: 8px;
        width: 32px;
        height: 32px;
      }
    }
  }

  .auto-renew {
    margin-top: 16px;
    color: $orange-10;
    font-style: normal;
  }
  .group-auto-renew {
    margin: 12px 20px -8px 20px;
    color: $yellow-5;
    font-style: normal;
  }
  .group-billing-date {
    width: 269px;
  }
}

#payments-success-modal .modal-footer {
  background: $gray-700;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  justify-content: center;
  border-top: none;

  .small-text {
    font-style: normal;
  }
}

.demographics {
  background-color: $gray-700;

  .label-text {
    margin-bottom: 20px;
  }

  .group-input {
    width: 400px !important;
    margin-top: -24px !important;
  }
  .btn {
    margin-top: 0px;
    width: 77px;
    margin-bottom: 20px;
  }
}
</style>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';


</style>


<script>
import checkIcon from '@/assets/svg/check.svg';
import gemIcon from '@/assets/svg/gem.svg';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';
import paymentsMixin from '@/mixins/payments';
import * as Analytics from '@/libs/analytics';

export default {
  components: {
    selectTranslatedArray,
    lockableLabel,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        gem: gemIcon,
      }),
      paymentData: {},
      groupPlanUpgraded: {
        demographics: null,
      },
    };
  },
  computed: {
    groupPlanCost () {
      const sub = this.paymentData.subscription;
      const memberCount = this.paymentData.group.memberCount || 1;
      console.log(this.paymentData);
      return sub.price + 3 * (memberCount - 1);
    },
    isFromBalance () {
      return this.paymentData.paymentType === 'gift-gems-balance';
    },
    upgradedGroup () {
      const upgradedGroup = (this.paymentData.paymentType !== 'groupPlan' || this.paymentData.newGroup);
      const demographicsKey = upgradedGroup.demographics;
      const groupPlanUpgraded = {
        demographics: demographicsKey,
      };
      return groupPlanUpgraded.demographics;
    },
  },
  mounted () {
    this.$root.$on('habitica:payment-success', data => {
      if (['subscription', 'groupPlan', 'gift-subscription'].indexOf(data.paymentType) !== -1) {
        data.subscription = subscriptionBlocks[data.subscriptionKey || data.gift.subscription.key];
      }
      this.paymentData = data;
      this.$root.$emit('bv::show::modal', 'payments-success-modal');
    });
  },
  beforeDestroy () {
    this.paymentData = {};
    this.$root.$off('habitica:payments-success');
  },
  methods: {
    submit () {
      Analytics.track({
        name: this.groupPlanUpgraded.demographics,
      },
      console.log(Analytics.track));
      this.paymentData = {};
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
    onwards () {
      this.paymentData = {};
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>
