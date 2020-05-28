<template>
  <b-modal
    id="subscription-canceled-modal"
    size="sm"
    :hide-footer="true"
    :modal-class="['modal-hidden-footer']"
  >
    <div slot="modal-header">
      <div
        v-once
        class="svg-icon close"
        @click="close()"
        v-html="icons.close"
      ></div>
      <div class="icon-container check-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon check"
          v-html="icons.check"
        ></div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 modal-body-col">
        <h2>{{ $t(isGroup ? 'canceledGroupPlan' : 'subCanceledTitle') }}</h2>
        <div class="details-block">
          <span>
            {{ $t('subWillBecomeInactive') }}
            <br>
            <strong>{{ isGroup ? groupDateTerminated : dateTerminated }}</strong>
          </span>
        </div>
        <span
          v-once
          class="auto-renew small-text"
        >{{ $t('paymentCanceledDisputes') }}</span>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

#subscription-canceled-modal .modal-header {
  border-top: 8px solid #1CA372;

  .check-container {
    background: #1CA372;
  }

  .check {
    width: 35.1px;
    height: 28px;
    color: white;
  }

  .close {
    position: absolute;
    top: 24px;
    right: 20px;
    width: 10px;
    height: 10px;
    margin: 0;
    padding: 0;
    cursor: pointer;

    &:hover {
      color: 878190;
    }
  }
}

#subscription-canceled-modal .modal-body {
  h2 {
    margin-bottom: 0px;
  }

  .details-block {
    line-height: 24px;
  }
}
</style>

<script>
import checkIcon from '@/assets/svg/check.svg';
import closeIcon from '@/assets/svg/close.svg';
import paymentsMixin from '@/mixins/payments';

export default {
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        close: closeIcon,
      }),
      groupDateTerminated: null,
      isGroup: null,
    };
  },
  mounted () {
    this.$root.$on('habitica:subscription-canceled', ({ dateTerminated, isGroup }) => {
      this.isGroup = isGroup;
      if (isGroup) {
        this.groupDateTerminated = dateTerminated;
      }
      this.$root.$emit('bv::show::modal', 'subscription-canceled-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:subscription-canceled');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'subscription-canceled-modal');
    },
  },
};
</script>
