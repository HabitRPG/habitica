<template>
  <div class="d-flex flex-row align-items-center justify-content-center number-increment">
    <!-- buy modal -->
    <div
      class="gray-circle"
      @click="quantity <= 0
        ? quantity = 0
        : quantity--"
    >
      <div
        class="icon-negative"
        v-html="icons.svgNegative"
      ></div>
    </div>
    <div class="input-group">
      <div class="align-items-center">
      </div>
      <input
        v-model="quantity"
        class="form-control alignment"
        step="1"
        type="number"
      >
    </div>
    <div
      class="gray-circle"
      @click="quantity++"
    >
      <div
        class="icon-positive"
        v-html="icons.svgPositive"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .number-increment {
    padding-bottom: 0px;
    }

  .alignment {
    text-align: center;
  }

  .input-group {
    width: 94px;
    height: 32px;
    width: 48px;
    margin: 0px 16px 0px 16px;
    padding: 0;
    border-radius: 2px;
    border: solid 1px $gray-400;
    background-color: $white;
  }

  .gray-circle {
    border-radius: 100%;
    border: solid 2px $gray-300;
    width: 32px;
    height: 32px;
    cursor: pointer;

    &:hover {
      border-color: $purple-300;
    }
  }

  .gray-circle:hover{
    .icon-positive, .icon-negative {
      & ::v-deep svg path {
        fill: $purple-300;
      }
    }
  }

  .icon-positive, .icon-negative {
    width: 10px;
    height: 10px;
    margin: 4px auto;

    & ::v-deep svg path {
      fill: $gray-300;
    }
  }

/* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

/* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

</style>

<script>
// icons
import svgGem from '@/assets/svg/gem.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgPositive from '@/assets/svg/positive.svg';
import svgNegative from '@/assets/svg/negative.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        svgGem,
        svgGold,
        svgPositive,
        svgNegative,
      }),
      item: { },
      quantity: 1,
    };
  },
  computed: {
  },
  watch: {
    quantity () {
      this.$emit('updateQuantity', this.quantity);
    },
  },
  methods: {
    setDefaults () {
      this.input = 1;
    },
  },
};

</script>
