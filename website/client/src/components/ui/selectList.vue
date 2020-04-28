<template>
  <div>
    <b-dropdown
      class="inline-dropdown"
      :disabled="disabled"
    >
      <template v-slot:button-content>
        <slot name="item" v-bind:item="value">
          <!-- Fallback content -->
          {{ value }}
        </slot>
      </template>
      <b-dropdown-item
        v-for="item in items"
        :key="item[keyProp]"
        :disabled="typeof item[disabledProp] === 'undefined' ? false : item[disabledProp]"
        :class="{active: item === value}"
        @click="$emit('select', item)"
      >
        <slot name="item" v-bind:item="item">
          <!-- Fallback content -->
          {{ item }}
        </slot>
      </b-dropdown-item>
    </b-dropdown>

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
    items: {
      type: Array,
    },
    disabled: {
      type: Boolean,
    },
    value: {
      type: Object,
    },
    keyProp: {
      type: String,
    },
    disabledProp: {
      type: String,
    },
  },
};
</script>
