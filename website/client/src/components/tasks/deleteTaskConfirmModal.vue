<template>
  <b-modal
    id="delete-task-confirm-modal"
    :hide-footer="true"
    :hide-header="true"
    modal-class="delete-confirm-modal"
    centered
  >
    <div class="modal-content-wrapper">
      <div class="top-bar"></div>
      <div class="modal-body-content">
        <div
          class="icon-wrapper"
          v-html="icons.alertIcon"
        ></div>
        <h2 class="modal-title">
          {{ displayTitle }}
        </h2>
        <p
          v-if="description"
          class="modal-description"
        >
          {{ description }}
        </p>
        <p class="modal-subtitle">
          {{ confirmationMessage }}
        </p>
        <div class="button-wrapper">
          <button
            class="btn btn-danger"
            @click="confirm()"
          >
            {{ buttonText }}
          </button>
          <button
            class="btn-cancel"
            @click="cancel()"
          >
            {{ $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import alertIcon from '@/assets/svg/for-css/alert.svg?raw';

export default {
  data () {
    return {
      confirmationMessage: '',
      taskType: '',
      description: '',
      customTitle: '',
      customButtonText: '',
      resolveCallback: null,
      icons: Object.freeze({
        alertIcon,
      }),
    };
  },
  computed: {
    displayTitle () {
      if (this.customTitle) return this.customTitle;
      return this.$t('deleteType', { type: this.taskType });
    },
    buttonText () {
      if (this.customButtonText) return this.customButtonText;
      return this.displayTitle;
    },
  },
  mounted () {
    this.$root.$on('habitica:delete-task-confirm', config => {
      this.confirmationMessage = config.message;
      this.taskType = config.taskType || '';
      this.description = config.description || '';
      this.customTitle = config.title || '';
      this.customButtonText = config.buttonText || '';
      this.resolveCallback = config.resolve;
      this.$root.$emit('bv::show::modal', 'delete-task-confirm-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:delete-task-confirm');
  },
  methods: {
    confirm () {
      if (this.resolveCallback) {
        this.resolveCallback(true);
      }
      this.close();
    },
    cancel () {
      if (this.resolveCallback) {
        this.resolveCallback(false);
      }
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'delete-task-confirm-modal');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

::v-deep .delete-confirm-modal {
  .modal-dialog {
    max-width: 330px;
    margin: auto;
  }

  .modal-content {
    border-radius: 8px;
    overflow: hidden;
    border: none;
  }

  .modal-body {
    padding: 0;
  }
}

.modal-content-wrapper {
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 8px;
  background-color: $maroon-100;
}

.modal-body-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px;
}

.icon-wrapper {
  margin-top: 40px;
  width: 48px;
  height: 48px;

  ::v-deep svg {
    width: 48px;
    height: 48px;

    path {
      fill: #DE3F3F;
    }
  }
}

.modal-title {
  margin-top: 16px;
  margin-bottom: 0;
  color: $maroon-100;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 20px;
  text-align: center;
}

.modal-description {
  margin-top: 12px;
  margin-bottom: 0;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0;
  text-align: center;
  color: $gray-50;
}

.modal-description + .modal-subtitle {
  margin-top: 16px;
}

.modal-subtitle {
  margin-top: 12px;
  margin-bottom: 0;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0;
  text-align: center;
  color: $gray-50;
}

.button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 16px;
  gap: 8px;
}

.btn-cancel {
  background: none;
  border: none;
  color: $purple-300;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0;
  cursor: pointer;
  padding: 8px 16px;

  &:hover {
    text-decoration: underline;
  }
}
</style>
