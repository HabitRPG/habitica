<template>
  <b-modal
    id="payments-success-modal"
    :hide-footer="isNewGroup || isGems || isSubscription || ownsJubilantGryphatrice"
    :modal-class="isNewGroup || isGems || isSubscription || ownsJubilantGryphatrice
      ? ['modal-hidden-footer'] : []"
  >
    <!-- HEADER -->
    <div slot="modal-header">
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="icon-close"
          v-html="icons.close"
        >
        </div>
      </div>
      <div class="check-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon svg-check"
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
        <!-- if you buy the Jubilant Gryphatrice during 10th birthday -->
        <template
          v-if="ownsJubilantGryphatrice"
        >
          <div class="words">
            <p class="jub-success">
              <span
                v-once
                v-html="$t('jubilantSuccess')"
              >
              </span>
            </p>
            <p class="jub-success">
              <span
                v-once
                v-html="$t('stableVisit')"
              >
              </span>
            </p>
          </div>
          <div class="gryph-bg">
            <img
              src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet-Gryphatrice-Jubilant-Large.gif"
              alt="a pink, purple, and green gryphatrice pet winks at you adorably"
              width="78px"
              height="72px"
            >
          </div>
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
        <!-- buttons for Jubilant Gryphatrice purchase during 10th birthday -->
        <button
          v-if="ownsJubilantGryphatrice"
          class="btn btn-primary mx-auto btn-jub"
          @click="closeAndRedirect()"
        >
          {{ $t('takeMeToStable') }}
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
          :disabled="!gift.message || sendingInProgress"
          class="btn btn-primary mx-auto"
          @click="sendMessage()"
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

#payments-success-modal {
  .modal-md {
    max-width: 448px;
    min-width: 330px;

  .modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .icon-close {
      width: 18px;
      height: 18px;
      vertical-align: middle;

      & svg path {
        fill: $green-1;
      }
       & :hover {
        fill: $green-1;
      }
    }
  }

  .modal-content {
    background: transparent;
  }

  .modal-header {
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

    .svg-check {
      width: 45px;
      color: $white;
    }
  }

  .modal-body {
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

    .words {
      margin-bottom: 16px;
      justify-content: center;
      font-size: 0.875rem;
      color: $gray-50;
      line-height: 1.71;
    }

    .jub-success {
      margin-top: 0px;
      margin-bottom: 0px;
    }

    .gryph-bg {
      width: 110px;
      height: 104px;
      align-items: center;
      justify-content: center;
      padding: 16px;
      border-radius: 4px;
      background-color: $gray-700;
    }
    .btn-jub {
      margin-bottom: 8px;
      margin-top: 24px;
    }

  }
    .modal-footer {
      background: $gray-700;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      justify-content: center;
      border-top: none;

      .small-text {
        font-style: normal;
      }
    }
  }
}

#payments-success-modal.modal-hidden-footer .modal-body {
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
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
// icons
import checkIcon from '@/assets/svg/check.svg';
import gemIcon from '@/assets/svg/gem.svg';
import closeIcon from '@/assets/svg/close.svg';

// components
import { mapState } from '@/libs/store';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';
import selectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import lockableLabel from '@/components/tasks/modal-controls/lockableLabel';

// mixins
import notificationsMixin from '@/mixins/notifications';
import paymentsMixin from '@/mixins/payments';

// analytics
import * as Analytics from '@/libs/analytics';

export default {
  components: {
    selectTranslatedArray,
    lockableLabel,
  },
  mixins: [
    paymentsMixin,
    notificationsMixin,
  ],
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
      sendingInProgress: false,
      gift: {
        message: '',
      },
      receiverName: {
        name: null,
        uuid: null,
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
      return this.paymentData.paymentType === 'gift-subscription';
    },
    isSubscription () {
      return this.paymentData.paymentType === 'subscription';
    },
    isGroupPlan () {
      return this.paymentData.paymentType === 'groupPlan';
    },
    isUpgradedGroup () {
      return this.paymentData.paymentType === 'groupPlan' && !this.paymentData.newGroup;
    },
    isNewGroup () {
      return this.paymentData.paymentType === 'groupPlan' && this.paymentData.newGroup;
    },
    ownsJubilantGryphatrice () {
      return this.paymentData.paymentType === 'sku'; // will need to be revised when there are other discrete skus in system
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
    async sendMessage () {
      this.sendingInProgress = true;
      await this.$store.dispatch('members:sendPrivateMessage', {
        message: this.gift.message,
        toUserId: this.paymentData.gift.uuid || this.paymentData.toUserId,
      });
      this.close();
    },
    close () {
      this.gift.message = '';
      this.sendingInProgress = false;
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
    closeAndRedirect () {
      if (this.$router.history.current.name !== 'stable') {
        this.$router.push('/inventory/stable');
      }
      this.close();
    },
    submit () {
      if (this.paymentData.group && !this.paymentData.newGroup) {
        Analytics.track({
          hitType: 'event',
          eventName: 'group plan upgrade',
          eventAction: 'group plan upgrade',
          eventCategory: 'behavior',
          demographics: this.upgradedGroup.demographics,
          type: this.paymentData.group.type,
        }, { trackOnClient: true });
      }
      this.paymentData = {};
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>
