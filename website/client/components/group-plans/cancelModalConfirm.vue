<template lang="pug">
  b-modal#group-plan-cancel-modal(
    size='sm',
    :hideFooter="true",
    :modalClass="['modal-hidden-footer']"
  )
    div(slot="modal-header") 
      .warning-container.d-flex.align-items-center.justify-content-center
        .svg-icon.warning(v-html="icons.warning", v-once)
    .row
      .col-12.modal-body-col
        h2(v-once) {{ $t('cancelGroupSub') }}
        span.cancel-text(v-once) {{ $t('confirmCancelGroupPlan') }}
        button.btn.btn-danger.mt-4.mb-3(v-once, @click="cancelSubscription(config)") {{ $t('cancelGroupSub') }}
        a.standard-link(v-once, @click="close()") {{ $t('neverMind') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#group-plan-cancel-modal .modal-content {
  background: transparent;
}

#group-plan-cancel-modal.modal-hidden-footer .modal-body {
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}

#group-plan-cancel-modal .modal-header {
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 0px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom: none;
  background: $white;
  border-top: 8px solid $maroon-100;

  .warning-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: $maroon-100;
    margin: 0 auto;
    margin-bottom: 8px;
  }

  .warning {
    width: 7px;
    height: 38px;
    color: white;
  }
}

#group-plan-cancel-modal .modal-body {
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

  h2 {
    margin-bottom: 8px;
  }

  .cancel-text {
    color: $gray-50;
    line-height: 1.71;
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

#group-plan-cancel-modal .modal-footer {
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
import warningIcon from 'assets/svg/exclamation.svg';
import paymentsMixin from 'client/mixins/payments';
import { mapState } from 'client/libs/store';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        warning: warningIcon,
      }),
      config: null,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  mounted () {
    this.$root.$on('habitica:cancel-group-plan', (config) => {
      this.config = config;
      this.$root.$emit('bv::show::modal', 'group-plan-cancel-modal');
    });
  },
  destroyed () {
    this.$root.$off('habitica:cancel-group-plan');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'group-plan-cancel-modal');
    },
  },
};
</script>