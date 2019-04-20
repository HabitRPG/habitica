<template lang="pug">
  b-modal#payments-success-modal(
    :title="$t('accountSuspendedTitle')", 
    size='sm',
    :hideFooter="isFromBalance",
    :modalClass="isFromBalance ? ['modal-hidden-footer'] : []"
  )
    div(slot="modal-header") 
      .check-container.d-flex.align-items-center.justify-content-center
        .svg-icon.check(v-html="icons.check", v-once)
      h2 {{ $t(isFromBalance ? 'success' : 'paymentSuccessful') }}
    div(slot="modal-footer")
      .small-text(v-once) {{ $t('giftSubscriptionText4') }}
    .row
      .col-12.modal-body-col
        template(v-if="paymentData.paymentType === 'gems'")
          strong(v-once) {{ $t('paymentYouReceived') }}
          .details-block.gems 
            .svg-icon(v-html="icons.gem", v-once)
            span 20
        template(v-if="paymentData.paymentType === 'gift-gems' || paymentData.paymentType === 'gift-gems-balance'")
          span(v-html="$t('paymentYouSentGems', {name: paymentData.giftReceiver})")
          .details-block.gems 
            .svg-icon(v-html="icons.gem", v-once)
            span {{ paymentData.gift.gems.amount }}
        template(v-if="paymentData.paymentType === 'gift-subscription'")
          span(v-html="$t('paymentYouSentSubscription', {name: paymentData.giftReceiver, months: paymentData.subscription.months})")
        template(v-if="paymentData.paymentType === 'subscription'")
          strong(v-once) {{ $t('nowSubscribed') }}
          .details-block
            span(v-html="$t('paymentSubBilling', {amount: paymentData.subscription.price, months: paymentData.subscription.months})")
        template(v-if="paymentData.paymentType === 'groupPlan'")
          span(v-html="$t(paymentData.newGroup ? 'groupPlanCreated' : 'groupPlanUpgraded', {groupName: paymentData.group.name})")
          .details-block
            span(v-html="$t('paymentSubBilling', {amount: groupPlanCost, months: paymentData.subscription.months})")
        template(v-if="paymentData.paymentType === 'groupPlan' || paymentData.paymentType === 'subscription'")
          span.small-text.auto-renew(v-once) {{ $t('paymentAutoRenew') }}
        button.btn.btn-primary(@click='close()', v-once) {{$t('onwards')}}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

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
  background: $green-10;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom: none;

  h2 { 
    color: white; 
  }

  .check-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #1CA372;
    margin: 0 auto;
    margin-bottom: 16px;
  }

  .check {
    width: 35.1px;
    height: 28px;
    color: white;
  }
}

#payments-success-modal .modal-body {
  padding-top: 16px;
  padding-bottom: 24px;
  background: white;

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
    padding: 8px 24px;
    margin-top: 16px;
    display: flex;
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
</style>

<script>
import checkIcon from 'assets/svg/check.svg';
import gemIcon from 'assets/svg/gem.svg';
import subscriptionBlocks from '../../../common/script/content/subscriptionBlocks';

export default {
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        gem: gemIcon,
      }),
      paymentData: {},
    };
  },
  mounted () {
    this.$root.$on('habitica:payment-success', (data) => {
      if (['subscription', 'groupPlan', 'gift-subscription'].indexOf(data.paymentType) !== -1) {
        data.subscription = subscriptionBlocks[data.subscriptionKey || data.gift.subscription.key];
      }
      this.paymentData = data;
      this.$root.$emit('bv::show::modal', 'payments-success-modal');
    });
  },
  destroyed () {
    this.paymentData = {};
    this.$root.$off('habitica:payments-success');
  },
  computed: {
    groupPlanCost () {
      const sub = this.paymentData.subscription;
      const memberCount = this.paymentData.group.memberCount || 1;
      return sub.price + 3 * (memberCount - 1);
    },
    isFromBalance () {
      return this.paymentData.paymentType === 'gift-gems-balance';
    },
  },
  methods: {
    close () {
      this.paymentData = {};
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>