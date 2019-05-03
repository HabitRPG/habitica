<template lang="pug">
  b-modal#subscription-canceled-modal(
    size='sm',
    :hideFooter="true",
    :modalClass="['modal-hidden-footer']"
  )
    div(slot="modal-header") 
      .check-container.d-flex.align-items-center.justify-content-center
        .svg-icon.check(v-html="icons.check", v-once)
    .row
      .col-12.modal-body-col
        h2 {{ $t(isGroup ? 'canceledGroupPlan' : 'subCanceledTitle') }}
        .details-block
            span
              | {{ $t('subWillBecomeInactive') }}
              br
              strong {{ dateTerminated }}
        span.auto-renew.small-text(v-once) {{ $t('paymentCanceledDisputes') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#subscription-canceled-modal .modal-content {
  background: transparent;
}

#subscription-canceled-modal.modal-hidden-footer .modal-body {
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}

#subscription-canceled-modal .modal-header {
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 0px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom: none;
  background: $white;
  border-top: 8px solid #1CA372;

  .check-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #1CA372;
    margin: 0 auto;
    margin-bottom: 8px;
  }

  .check {
    width: 35.1px;
    height: 28px;
    color: white;
  }
}

#subscription-canceled-modal .modal-body {
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
    margin-bottom: 0px;
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
    line-height: 24px;
  }

  .auto-renew {
    margin-top: 16px;
    color: $orange-10;
    font-style: normal;
  }
}

#subscription-canceled-modal .modal-footer {
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
import paymentsMixin from 'client/mixins/payments';
import { mapState } from 'client/libs/store';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
      }),
      dateTerminated: null,
      isGroup: null,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  mounted () {
    this.$root.$on('habitica:subscription-canceled', ({dateTerminated, isGroup}) => {
      this.dateTerminated = dateTerminated;
      this.isGroup = isGroup;
      this.$root.$emit('bv::show::modal', 'subscription-canceled-modal');
    });
  },
  destroyed () {
    this.$root.$off('habitica:subscription-canceled');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'subscription-canceled-modal');
    },
  },
};
</script>