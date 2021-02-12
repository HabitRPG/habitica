<template>
  <b-modal
    id="payments-success-modal"
    :hide-footer="isFromBalance"
    header-class="d-block justify-content-center pt-4 text-white"
    footer-class="small-text justify-content-center p-3 greyed"
    size="sm"
  >
    <template #modal-header>
      <div class="check-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon check"
          v-html="icons.check"
        ></div>
      </div>
      <h2 class="text-center">{{ title }}</h2>
    </template>
    <section class="d-flex flex-column align-items-center text-center px-0">
      <span v-html="subTitle" :class="{ 'font-weight-bold': boldSubTitle }"></span>
      <div class="details-block d-flex text-center mt-3" :class="{ gems }" v-if="details">
        <div
          v-if="gems"
          class="svg-icon mr-2"
          v-html="icons.gem"
        ></div>
        <span v-html="details"></span>
      </div>
      <span
          v-if="renew"
          class="small-text auto-renew mt-3"
      >{{ $t('paymentAutoRenew') }}</span>
      <button
        v-once
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
    </section>
    <template #modal-footer>
      {{ $t('giftSubscriptionText4') }}
    </template>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/mixins.scss';

#payments-success-modal .modal-dialog {
  @include smallModal();

  .small-text {
    font-style: normal;
  }

  .modal-header {
    background: $green-100;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    h2 {
      margin: 1rem;
      color: inherit;
    }

    .check-container {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: $green-10;
      margin: 0 auto;
    }

    .check {
      width: 35.1px;
      height: 28px;
    }
  }

  .modal-body {
    padding: 1rem 1rem 0;
    border-radius: 8px;

    .details-block {
      background: $gray-700;
      border-radius: 4px;
      padding: 0.5rem 1.5rem;

      &.gems {
        padding: 12px 16px 12px 20px;
        color: $green-10;
        font-size: 24px;
        font-weight: bold;
        line-height: 1.33;

        .svg-icon {
          width: 2rem;
          height: 2rem;
        }
      }
    }

    .auto-renew {
      color: $orange-10;
    }

    .btn.btn-primary {
      margin: 1.5rem auto;
    }
  }

  .modal-footer {
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }
}
</style>

<script>
import checkIcon from '@/assets/svg/check.svg';
import gemIcon from '@/assets/svg/gem.svg';
import subscriptionBlocks from '@/../../common/script/content/subscriptionBlocks';

function groupPlanCost (price, memberCount = 1) {
  return price + 3 * (memberCount - 1);
}

export default {
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        gem: gemIcon,
      }),
      isFromBalance: false,
      gems: false,
      boldSubTitle: false,
      subTitle: '',
      details: '',
      renew: false,
    };
  },
  computed: {
    title () {
      return this.$t(this.isFromBalance ? 'success' : 'paymentSuccessful');
    },
  },
  mounted () {
    this.$root.$on('habitica:payment-success', data => {
      const type = data.paymentType;
      this.isFromBalance = type.includes('balance');
      this.gems = type.includes('gems');

      if (this.gems) {
        this.setGemData(type === 'gems', data);
      } else {
        this.setSubscriptionData(type, data);
      }
      this.$root.$emit('bv::show::modal', 'payments-success-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:payments-success');
  },
  methods: {
    setGemData (boughtGems, data) {
      this.subTitle = boughtGems ? this.$t('paymentYouReceived')
        : this.$t('paymentYouSentGems', { name: data.giftReceiver });
      this.boldSubTitle = boughtGems;
      this.details = boughtGems ? data.gemsBlock.gems : data.gift.gems.amount;
      this.renew = false;
    },
    setSubscriptionData (type, data) {
      const { price, months } = subscriptionBlocks[
        data.subscriptionKey || data.gift.subscription.key
      ];
      const gift = type.includes('gift');
      const groupPlan = type.includes('group');
      const subbed = type === 'subscription';
      const amount = groupPlan ? groupPlanCost(price, data.group.memberCount) : price;

      if (groupPlan) {
        this.subTitle = this.$t(data.newGroup ? 'groupPlanCreated'
          : 'groupPlanUpgraded', { groupName: data.group.name });
      } else {
        this.subTitle = subbed ? this.$t('nowSubscribed')
          : this.$t('paymentYouSentSubscription', { name: data.giftReceiver, months });
      }

      this.boldSubTitle = subbed;
      this.details = gift ? '' : this.$t('paymentSubBilling', { amount, months });
      this.renew = !gift;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>
