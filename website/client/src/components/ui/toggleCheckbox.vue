<template>
  <button class="toggle-checkbox"
    :class="{checked: isChecked}"
    @click="isChecked = !isChecked"
    type="button"
    :disabled="disabled">
    {{ text }}
  </button>
</template>

<script>
export default {
  props: {
    checked: Boolean,
    disabled: Boolean,
    text: String,
  },
  data () {
    return {
      isChecked: this.checked,
    };
  },
  watch: {
    checked (after) {
      this.isChecked = after;
    },
    isChecked (after) {
      this.$emit('update:checked', after);
    },
  },
};
</script>

<style  lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .toggle-checkbox {
    display: flex;
    justify-content: center;
    align-items: center;

    height: 2rem;
    border: solid 1px $gray-400;
    background-color: $white;

    cursor: pointer;

    > * {
      line-height: 1.71;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }

    &:disabled, &.disabled {
      cursor: default;
      opacity: 0.75;
    }

    &:not(.disabled):not(:disabled) {
      &.checked {
        border: solid 1px $purple-100;
        background-color: $purple-300;
        color: $white;
      }

      &:hover {
        border: solid 1px $gray-300;
        background-color: $white;
        color: $purple-300;
      }

      &:focus, &:active {
        border: solid 1px $purple-400;
        background-color: $white;
        color: $gray-50;

        outline: 0;
      }

      &:not(:first-of-type) {
        border-left: none;
      }

      &:first-of-type {
        border-bottom-left-radius: 2px;
        border-top-left-radius: 2px;
      }
      &:last-of-type {
        border-bottom-right-radius: 2px;
        border-top-right-radius: 2px;
      }
    }
  }
</style>

<style lang="scss">
  .toggle-group {
    display: flex;
    flex-direction: row;
    width: 100%;

    .toggle-checkbox {
      flex: 1;
    }
  }
</style>
