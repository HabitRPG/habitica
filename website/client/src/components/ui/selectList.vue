<template>
  <div class='select-list p-y-xs p-x-m'>
    {{ value }}
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .select-list {
    width: 100%;
    height: 2rem;
    border-radius: 2px;
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    background-color: $white;
    line-height: 1.71;
    border: 1px solid transparent;
    user-select: none;
    cursor: pointer;

    &:hover:not(.disabled), &:focus:not(.disabled) {
      box-shadow: 0 3px 6px 0 rgba($black, 0.16), 0 3px 6px 0 rgba($black, 0.24);
    }

    &:focus, &:active {
      border: 1px solid $purple-400;
    }

    &:active {
      box-shadow: none;
    }

    &.disabled {
      color: $gray-200;
      background-color: $gray-700;
      cursor: default;
    }
  }
</style>

<script>
export default {
  props: {
    value: {
      type: String,
    },
  },
};
</script>
