<template lang="pug">
  b-modal#subscription-cancel-modal(
    size='sm',
    :hideFooter="true",
    :modalClass="['modal-hidden-footer']"
  )
    div(slot="modal-header")
      .icon-container.warning-container.d-flex.align-items-center.justify-content-center
        .svg-icon.warning(v-html="icons.warning", v-once)
    .row
      .col-12.modal-body-col
        h2 {{ config && config.group ? $t('cancelGroupSub') : $t('cancelSub') }}
        span.cancel-text {{ config && config.group ? $t('confirmCancelGroupPlan') : $t('confirmCancelSub') }}
        button.btn.btn-danger.mt-4.mb-3(v-once, @click="close(); cancelSubscription(config)") {{ $t('cancelSub') }}
        a.standard-link(v-once, @click="close()") {{ $t('neverMind') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#subscription-cancel-modal .modal-header {
  border-top: 8px solid $maroon-100;

  .warning-container {
    background: $maroon-100;
  }

  .warning {
    width: 7px;
    height: 38px;
    color: white;
  }
}
</style>

<script>
import warningIcon from 'assets/svg/exclamation.svg';
import closeIcon from 'assets/svg/close.svg';
import paymentsMixin from 'client/mixins/payments';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        warning: warningIcon,
        close: closeIcon,
      }),
      config: null,
    };
  },
  mounted () {
    this.$root.$on('habitica:cancel-subscription-confirm', (config) => {
      this.config = config;
      this.$root.$emit('bv::show::modal', 'subscription-cancel-modal');
    });
  },
  destroyed () {
    this.$root.$off('habitica:cancel-subscription-confirm');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'subscription-cancel-modal');
    },
  },
};
</script>