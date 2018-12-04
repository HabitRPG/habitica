<template lang="pug">
  b-modal#payments-success-modal(
    :title="$t('accountSuspendedTitle')", 
    size='sm', 
  )
    div(slot="modal-header") 
      .check-container.d-flex.align-items-center.justify-content-center
        .svg-icon.check(v-html="icons.check")
      h2(v-ocne) {{ $t('paymentSuccessful') }}
    div(slot="modal-footer")
      .small-text(v-once) {{ $t('giftSubscriptionText4') }}
    .row
      .col-12.text-center
        button.btn.btn-primary(@click='close()') {{$t('onwards')}}
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

export default {
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
      }),
    };
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'payments-success-modal');
    },
  },
};
</script>