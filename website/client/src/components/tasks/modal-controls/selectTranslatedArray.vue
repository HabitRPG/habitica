<template>
  <div>
    <select-list
      :items="items"
      :value="selected"
      class="array-select"
      :class="{disabled: disabled}"
      :disabled="disabled"
      :right="right"
      :hide-icon="false"
      :inline-dropdown="inlineDropdown"
      :placeholder="placeholder"
      @select="selectItem($event)"
    >
      <template v-slot:item="{ item }">
        <span class="label">{{ $t(item) }}</span>
      </template>
    </select-list>
  </div>
</template>

<style lang="scss" scoped>
</style>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .array-select.disabled {
    .btn-secondary:disabled, .btn-secondary.disabled, .dropdown >
    .btn-secondary.dropdown-toggle:not(.btn-success):disabled, .dropdown >
    .btn-secondary.dropdown-toggle:not(.btn-success).disabled, .show >
    .btn-secondary.dropdown-toggle:not(.btn-success):disabled, .show >
    .btn-secondary.dropdown-toggle:not(.btn-success).disabled {
      background: $gray-700;
    }

    .dropdown-toggle::after {
      color: $gray-300;
      border-top-color: $gray-300;
    }

    .label {
      color: $gray-200;
    }
  }

  .array-select .disabled, .array-select .disabled:hover {
    box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
  }
</style>

<script>
import selectList from '@/components/ui/selectList';

export default {
  components: {
    selectList,
  },
  props: {
    items: {
      type: Array,
    },
    disabled: {
      type: Boolean,
    },
    value: [String, Number, Object],
    right: {
      type: Boolean,
    },
    inlineDropdown: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
    },
  },
  data () {
    return {
      selected: this.items.find(i => i === this.value),
    };
  },
  methods: {
    selectItem (item) {
      this.selected = item;
      this.$emit('select', item);
    },
  },
};
</script>
