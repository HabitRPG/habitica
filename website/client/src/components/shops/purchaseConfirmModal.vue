<template>
  <b-modal
    id="purchase-confirm-modal"
    :hide-footer="true"
    :hide-header="true"
    modal-class="purchase-confirm-modal"
    centered
  >
    <div class="modal-content-wrapper">
      <div class="top-bar"></div>
      <div class="modal-body-content">
        <div
          class="currency-chip"
          :class="currency"
        >
          <span
            class="svg-icon icon-24"
            v-html="icons[currency]"
          ></span>
          <span class="cost-value">{{ cost }}</span>
        </div>
        <h2 class="modal-title">
          {{ $t('confirmPurchase') }}
        </h2>
        <p class="modal-subtitle">
          {{ confirmationMessage }}
        </p>
        <div class="button-wrapper">
          <button
            class="btn btn-primary"
            @click="confirm()"
          >
            {{ $t('confirm') }}
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
import svgGem from '@/assets/svg/gem.svg?raw';
import svgHourglass from '@/assets/svg/hourglass.svg?raw';

export default {
  data () {
    return {
      confirmationMessage: '',
      currency: 'gems',
      cost: 0,
      resolveCallback: null,
      icons: Object.freeze({
        gems: svgGem,
        hourglasses: svgHourglass,
      }),
    };
  },
  mounted () {
    this.$root.$on('habitica:purchase-confirm', config => {
      this.confirmationMessage = config.message;
      this.currency = config.currency || 'gems';
      this.cost = config.cost || 0;
      this.resolveCallback = config.resolve;
      this.$root.$emit('bv::show::modal', 'purchase-confirm-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:purchase-confirm');
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
      this.$root.$emit('bv::hide::modal', 'purchase-confirm-modal');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

::v-deep .purchase-confirm-modal {
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
  background-color: $purple-300;
}

.modal-body-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px;
}

.currency-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.4;

  &.gems {
    color: $gems-color;
    background-color: rgba($green-10, 0.15);
  }

  &.hourglasses {
    color: $hourglass-color;
    background-color: rgba($blue-10, 0.15);
  }

  .icon-24 {
    width: 24px;
    height: 24px;
  }
}

.modal-title {
  margin-top: 16px;
  margin-bottom: 0;
  color: $purple-300;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 20px;
  text-align: center;
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
