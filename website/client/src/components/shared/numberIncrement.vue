<template>
  <div class="d-flex flex-row align-items-center justify-content-center number-increment">
    <!-- buy modal -->
    <div
      class="gray-circle"
      @click="setQuantity <= 0
        ? setQuantity = 0
        : setQuantity--"
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
        class="form-control alignment"
        :quantity="1"
        min="0"
        step="1"
      >
    </div>
    <div
      class="gray-circle"
      @click="setQuantity++"
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
  props: {
    quantity: {
      type: Number,
      default: 1,
    },
    item: {
      type: Object,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        svgGem,
        svgGold,
        svgPositive,
        svgNegative,
      }),
    };
  },
  computed: {
    setQuantity () {
      const setQuantity = this.item.value * this.quantity;
      return setQuantity;
    },
  },
  methods: {
  },
};

</script>
