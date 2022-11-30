<template>
  <div class="d-flex flex-row align-items-center justify-content-center number-increment">
    <!-- buy modal -->
    <div
      class="gray-circle"
      @click="selectedAmountToBuy <= 0
        ? selectedAmountToBuy = 0
        : selectedAmountToBuy--"
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
        v-model="selectedAmountToBuy"
        class="form-control alignment"
        min="0"
        step="1"
      >
    </div>
    <div
      class="gray-circle"
      @click="selectedAmountToBuy++"
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
    padding-bottom: 12px;
    }

  .alignment {
    text-align: center;
  }

  // label {
  //   color: $gray-50;
  //   font-size: 0.875rem;
  //   font-weight: bold;
  //   line-height: 1.71;
  //   margin: 12px 0 16px 0;
  //   width: 100%;
  //   text-align: center;
  // }

  .input-group {
    width: 94px;
    height: 32px;
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
      border-color: $purple-400;
    }
  }

  .gray-circle:hover{
    .icon-positive, .icon-negative {
      & ::v-deep svg path {
        fill: $purple-400;
      }
    }
  }

  .icon-gem {
    width: 16px;
    height: 16px;
    margin-bottom: 4px;
  }

  .icon-positive, .icon-negative {
    width: 10px;
    height: 10px;
    margin: 4px auto;

    & ::v-deep svg path {
      fill: $gray-300;
    }
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
      selectedAmountToBuy: 1,
    };
  },
  computed: {
  },
  methods: {
    preventNegative ($event) {
      const { value } = $event.target;

      if (Number(value) < 0) {
        this.selectedAmount = 0;
      }
    },
  },
};

</script>
