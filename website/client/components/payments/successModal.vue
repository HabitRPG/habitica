<template lang="pug">
  b-modal#payments-success-modal(
    :title="$t('accountSuspendedTitle')", 
    size='sm', 
  )
    div(slot="modal-header") 
      .check-container.d-flex.align-items-center.justify-content-center
        .svg-icon.check(v-html="icons.check")
      h2(v-once) {{ $t('paymentSuccessful') }}
    div(slot="modal-footer")
      .small-text(v-once) {{ $t('giftSubscriptionText4') }}
    .row
      .col-12.modal-body-col
        template(v-if="paymentData.paymentType === 'gems'")
          strong You received:
          .details-block.gems 
            .svg-icon(v-html="icons.gem")
            span 20
        button.btn.btn-primary(@click='close()', v-once) {{$t('onwards')}}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#payments-success-modal .modal-content {
  background: transparent;
}

#payments-success-modal .modal-header {
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 0px;
  background: $green-10;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
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
  }

  .details-block {
    background: $gray-700;
    border-radius: 4px;
    padding: 8px 24px;
    margin-top: 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: row;

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
}

#payments-success-modal .modal-footer {
  background: $gray-700;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  justify-content: center;

  .small-text {
    font-style: normal;
  }
}
</style>

<script>
import checkIcon from 'assets/svg/check.svg';
import gemIcon from 'assets/svg/gem.svg';

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
      console.log(data);
      this.paymentData = data;
      this.$root.$emit('bv::show::modal', 'payments-success-modal');
    });
  },
  destroyed () {
    this.paymentData = {};
    this.$root.$off('habitica:payments-success');
  },
  methods: {
    close () {
      this.paymentData = null;
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>