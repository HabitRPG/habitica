<template>
  <b-modal
    id="subscription-cancel-modal"
    size="sm"
    :hide-footer="true"
    :modal-class="['modal-hidden-footer']"
  >
    <div slot="modal-header">
      <div
        class="icon-container warning-container d-flex align-items-center justify-content-center"
      >
        <div
          v-once
          class="svg-icon warning"
          v-html="icons.warning"
        ></div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 modal-body-col">
        <h2>{{ config && config.group ? $t('cancelGroupSub') : $t('cancelSub') }}</h2>
        <span
          class="cancel-text"
        >{{ config && config.group ? $t('confirmCancelGroupPlan') : $t('confirmCancelSub') }}</span>
        <button
          v-once
          class="btn btn-danger mt-4 mb-3"
          @click="close(); cancelSubscription(config)"
        >
          {{ $t('cancelSub') }}
        </button>
        <a
          v-once
          @click="close()"
        >{{ $t('neverMind') }}</a>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

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
import warningIcon from '@/assets/svg/exclamation.svg';
import closeIcon from '@/assets/svg/close.svg';
import paymentsMixin from '@/mixins/payments';

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
    this.$root.$on('habitica:cancel-subscription-confirm', config => {
      this.config = config;
      this.$root.$emit('bv::show::modal', 'subscription-cancel-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:cancel-subscription-confirm');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'subscription-cancel-modal');
    },
  },
};
</script>
