<template>
  <b-modal
    id="payments-success-modal"
    :title="$t('accountSuspendedTitle')"
    :hide-footer="isNewGroup || isGems || isSubscription || isGiftSubscription"
    :modal-class="isNewGroup || isGems || isSubscription || isGiftSubscription
      ? ['modal-hidden-footer'] : []"
  >
    <!-- HEADER -->
    <div slot="modal-header">
      <div class="check-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon check"
          v-html="icons.check"
        ></div>
      </div>
      <h2>{{ $t(isGemsBalance ? 'success' : 'paymentSuccessful') }}</h2>
    </div>
    <!-- BODY -->
    <div class="row">
      <div class="col-12 modal-body-col">
        <!-- buy gems for self -->
        <template v-if="isGems">
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
        <!-- buy gems to someone else OR send gems from balance-->
        <template
          v-if="isGiftGems || isGemsBalance"
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
          <div>
            <span
              v-html="$t('paymentYouSentSubscription', {
                name: paymentData.giftReceiver, months: paymentData.subscription.months})"
            ></span>
          </div>
        </template>
        <!-- buy self subscription (recurring) -->
        <template v-if="isSubscription">
          <strong v-once>{{ $t('nowSubscribed') }}</strong>
          <div class="details-block">
            <span
              v-html="$t('paymentSubBilling', {
                amount: paymentData.subscription.price, months: paymentData.subscription.months})"
            ></span>
          </div>
        </template>
        <!-- group plan new or upgraded -->
        <template v-if="isGroupPlan">
          <span
            v-html="$t(isNewGroup
              ? 'groupPlanCreated' : 'groupPlanUpgraded', {groupName: paymentData.group.name})"
          ></span>
          <div
            v-if="isGroupPlan"
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
          v-if="isSubscription"
        >
          <span
            v-once
            class="small-text auto-renew"
          >{{ $t('paymentAutoRenew') }}</span>
        </template>
        <!-- buttons for subscriptions / new Group / buy Gems for self -->
        <button
          v-if="isNewGroup || isGems || isSubscription"
          v-once
          class="btn btn-primary"
          @click="submit()"
        >
          {{ $t('onwards') }}
        </button>
      </div>
    </div>
    <!-- FOOTER -->
    <div slot="modal-footer">
      <!-- gift gems balance & buy, gift subscription -->
      <div
        v-if="isGemsBalance || isGiftGems || isGiftSubscription"
        class="message mx-auto"
      >
        <lockable-label
          :text="$t('sendGiftLabel')"
          class="mx-auto label-text"
        />
        <textarea
          v-model="gift.message"
          class="form-control mx-auto"
          :placeholder="$t('sendGiftMessagePlaceholder')"
        ></textarea>
        <button
          :disabled="!gift.message"
          class="btn btn-primary mx-auto"
          @click="submit()"
        >
          {{ $t('sendMessage') }}
        </button>
      </div>
      <!-- upgradedGroup -->
      <div
        v-else-if="isUpgradedGroup"
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
          :value="upgradedGroup.demographics"
          @select="upgradedGroup.demographics = $event"
        />
        <button
          v-if="!paymentData.newGroup"
          class="btn btn-primary mx-auto"
          :disabled="!upgradedGroup.demographics"
          @click="submit()"
        >
          {{ $t('submit') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

#payments-success-modal .modal-md {
  max-width: 448px;
  min-width: 330px;
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
.message {
  margin-bottom: 8px;
  width: 378px;
  display: flex;
  flex-direction: column;

  textarea.form-control {
    height: 56px;
    margin: 0 24px 24px 24px;
    font-size: 0.875rem;
  }
}

</style>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';


</style>


<script>
import checkIcon from '@/assets/svg/check.svg';
import gemIcon from '@/assets/svg/gem.svg';
import closeIcon from '@/assets/svg/close.svg';
import { MAX_GIFT_MESSAGE_LENGTH } from '@/../../common/script/constants';
import { mapState } from '@/libs/store';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';
import notificationsMixin from '@/mixins/notifications';
import paymentsMixin from '@/mixins/payments';
import * as Analytics from '@/libs/analytics';

export default {
  components: {
    selectTranslatedArray,
    lockableLabel,
  },
  mixins: [paymentsMixin, notificationsMixin],
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        gem: gemIcon,
        close: closeIcon,
      }),
      paymentData: {},
      upgradedGroup: {
        name: '',
        demographics: null,
      },

      MAX_GIFT_MESSAGE_LENGTH: MAX_GIFT_MESSAGE_LENGTH.toString(),
      gift: {
        message: '',
      },
    };
  },
  computed: {
    ...mapState({ user: 'user.data', group: 'group.data' }),
    groupPlanCost () {
      const sub = this.paymentData.subscription;
      const memberCount = this.paymentData.group.memberCount || 1;
      return sub.price + 3 * (memberCount - 1);
    },
    isGemsBalance () {
      return this.paymentData.paymentType === 'gift-gems-balance';
    },
    isGems () {
      return this.paymentData.paymentType === 'gems';
    },
    isGiftGems () {
      return this.paymentData.paymentType === 'gift-gems';
    },
    isGiftSubscription () {
      return this.paymentData.paymentType === 'subscription';
    },
    isSubscription () {
      return this.paymentData.paymentType === 'subscription';
    },
    isGroupPlan () { // might not need this function
      return this.paymentData.paymentType === 'groupPlan';
    },
    isUpgradedGroup () {
      return this.paymentData.paymentType === 'groupPlan' && !this.paymentData.newGroup;
    },
    isNewGroup () {
      return this.paymentData.paymentType === 'groupPlan' && this.paymentData.newGroup;
    },
  },
  mounted () {
    this.$root.$on('habitica:payment-success', data => {
      if (['subscription', 'groupPlan', 'gift-subscription'].indexOf(data.paymentType) !== -1) {
        data.subscription = subscriptionBlocks[data.subscriptionKey || data.gift.subscription.key];
      }
      this.paymentData = data;
      console.log('data.paymentType: ', data.paymentType);
      this.$root.$emit('bv::show::modal', 'payments-success-modal');
    });
  },
  beforeDestroy () {
    this.paymentData = {};
    this.$root.$off('habitica:payments-success');
  },
  methods: {
    submit () {
      if (this.isUpgradedGroup) {
        Analytics.track({
          hitType: 'event',
          eventName: 'group plan upgrade',
          eventAction: 'group plan upgrade',
          eventCategory: 'behavior',
          demographics: this.upgradedGroup.demographics,
          type: this.paymentData.group.type,
        });
      }
      this.paymentData = {};
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>
