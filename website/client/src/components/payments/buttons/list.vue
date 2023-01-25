<template>
  <div class="payments-column mx-auto mt-auto">
    <h4>{{ $t('choosePaymentMethod') }}</h4>
    <button
      v-if="stripeAvailable"
      class="btn btn-primary payment-button payment-item with-icon"
      :class="{disabled}"
      :disabled="disabled"
      @click="stripeFn()"
    >
      <div
        v-once
        class="svg-icon color credit-card-icon"
        v-html="icons.creditCardIcon"
      ></div>
      {{ $t('card') }}
    </button>
    <button
      v-if="paypalAvailable"
      class="btn payment-item paypal-checkout payment-button"
      :class="{disabled}"
      :disabled="disabled"
      @click="paypalFn()"
    >
      &nbsp;
      <img
        src="~@/assets/images/paypal-checkout.png"
        :alt="$t('paypal')"
      >&nbsp;
    </button>
    <amazon-button
      v-if="amazonAvailable"
      class="payment-item"
      :disabled="disabled"
      :amazon-data="amazonData"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .payments-column {
    display: flex;
    flex-direction: column;
    width: 296px;
    justify-content: center;

    .payment-item {
      margin-bottom: 12px;
      display: flex;

      &.payment-button {
        display: flex;
        justify-content: center;
        align-items: center;

        .credit-card-icon {
          width: 21.3px;
          height: 16px;
          margin-right: 8.7px;
        }

        &.paypal-checkout {
          background: #009cde;

          img {
            width: 157px;
            height: 21px;
          }
        }
      }
    }
  }

  .disabled {
    opacity: 0.64;

    .btn, .btn:hover, .btn:active {
      box-shadow: none;
      cursor: default !important;
    }
  }

  h4 {
    color: $gray-10;
    font-size: 0.875rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
  }
</style>

<script>
import amazonButton from '@/components/payments/buttons/amazon';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';

export default {
  components: {
    amazonButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    amazonData: {
      type: Object,
    },
    stripeFn: {
      type: Function,
    },
    paypalFn: {
      type: Function,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        creditCardIcon,
      }),
    };
  },
  computed: {
    stripeAvailable () {
      return typeof this.stripeFn === 'function';
    },
    paypalAvailable () {
      return typeof this.paypalFn === 'function';
    },
    amazonAvailable () {
      return this.amazonData !== undefined;
    },
  },
};
</script>
