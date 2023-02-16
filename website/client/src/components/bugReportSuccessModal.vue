<template>
  <b-modal
    :id="modalId"
    size="md"
    :hide-footer="true"
  >
    <div
      slot="modal-header"
      class="bug-report-modal-header"
    >
      <div class="green-bar"></div>

      <div class="sub-header position-relative">
        <div class="dialog-close">
          <close-icon @click="close()" />
        </div>
      </div>
    </div>
    <div>
      <span
        class="svg-icon check-icon"
        v-html="icons.checkCircleIcon"
      ></span>

      <div
        v-once
        class="title"
      >
        {{ $t('reportSent') }}
      </div>

      <div
        v-once
        class="text mt-3 mb-4"
      >
        {{ $t('reportSentDescription') }}
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
#bug-report-success-modal {

  .modal-header {
    padding: 0;
    border: none;
  }

  .modal-content {
    border: 0;
  }

  .modal-dialog {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    overflow: auto;
    width: 330px;
  }

  .modal-body {
    padding: 0 1.5rem;
  }

  .modal-footer {
    border-top: 0;
    padding-bottom: 0;
  }
}
</style>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

h2 {
  color: $white;
}

.bug-report-modal-header {
  width: 100%;

  .green-bar {
    height: 8px;
    width: 100%;
    background-color: $green-10;
  }
}

.check-icon {
  width: 64px;
  height: 64px;

  margin: 0 auto;
  margin-top: -0.25rem;
}

.report-bug-header-describe {
  font-size: 14px;
  line-height: 1.71;
  color: $purple-600;
}

label {
  font-weight: bold;
  line-height: 1.71;
  color: $gray-50;
}

.cancel-link {
  line-height: 1.71;
}

.submit-button {
  width: auto;
}

.error-label {
  font-size: 12px;
  line-height: 1.33;
  color: $maroon-10;
}

.description-label {
  font-size: 12px;
  line-height: 1.33;
  color: $gray-100;
}

.text {
  min-height: 0;
}

</style>

<script>
import closeIcon from '@/components/shared/closeIcon';
import checkCircleIcon from '@/assets/svg/check_circle.svg';
import { MODALS } from '@/libs/consts';

export default {
  components: {
    closeIcon,
  },
  data () {
    return {
      icons: Object.freeze({
        checkCircleIcon,
      }),
      modalId: MODALS.BUG_REPORT_SUCCESS,
    };
  },
  computed: {},
  mounted () {},
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', MODALS.BUG_REPORT_SUCCESS);
    },
  },
};
</script>
