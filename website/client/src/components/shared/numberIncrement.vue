<template>
  <div class="d-flex flex-row align-items-center justify-content-center">
    <div
      class="gray-circle"
      @click="gems.amount <= 0
        ? gems.amount = 0
        : gems.amount--"
    >
      <div
        class="icon-negative"
        v-html="icons.negativeIcon"
      ></div>
    </div>
    <div class="input-group">
      <div class="input-group-prepend input-group-icon align-items-center">
        <div
          class="icon-gem"
          v-html="icons.gemIcon"
        ></div>
      </div>
      <input
        id="gemsForm"
        v-model.number="gems.amount"
        class="form-control"
        :max="itemContextToSell.itemCount"
      >
    </div>
    <div
      class="gray-circle"
      @click="gems.amount++"
    >
      <div
        class="icon-positive"
        v-html="icons.positiveIcon"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  label {
    color: $gray-50;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    margin: 12px 0 16px 0;
    width: 100%;
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
import gemIcon from '@/assets/svg/gem.svg';
import goldIcon from '@/assets/svg/gold.svg';
import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        gold: gemIcon,
        gem: goldIcon,
        plus: positiveIcon,
        minus: negativeIcon,
      }),
    };
  },
};

</script>
