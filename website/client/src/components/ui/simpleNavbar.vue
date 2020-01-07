<template>
  <div class="nav">
    <div
      v-for="item in items"
      :key="item"
      class="nav-item"
      :class="{active: item === active}"
      @click="$emit('change', item)"
    >
      {{ $t(item) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .nav-item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1em 1em calc(1em - 2px);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    text-align: center;
  }

  .nav-item:hover, .nav-item.active {
    color: $purple-300;
    border-bottom-color: $purple-300;
  }

  .nav {
    display: flex;
    font-weight: bold;
    justify-content: center;

    &.gray {
      background-color: $gray-600;
    }

    &.large .nav-item {
      font-size: 16px;
      padding-bottom: calc(1em - 4px);
      border-bottom-width: 4px;
    }

    &.split-words .nav-item {
      flex-basis: 0;
    }
  }
</style>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },

    active: {
      type: String,
      required: true,
    },
  },
};
</script>
