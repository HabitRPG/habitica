<template>
  <div>
    <b-dropdown
      class="inline-dropdown"
      @show="isOpened = true"
      @hide="isOpened = false"
      :toggle-class="isOpened ? 'active' : null"
      :disabled="disabled"
    >
      <template v-slot:button-content>
        <slot name="item" v-bind:item="selected" v-bind:button="true">
          <!-- Fallback content -->
          {{ value }}
        </slot>
      </template>
      <b-dropdown-item
        v-for="item in items"
        :key="keyProp ? item[keyProp] : item"
        :disabled="typeof item[disabledProp] === 'undefined' ? false : item[disabledProp]"
        :class="{active: item === selected, selectListItem: true}"
        @click="selectItem(item)"
      >
        <slot name="item" v-bind:item="item" v-bind:button="false">
          <!-- Fallback content -->
          {{ item }}
        </slot>
      </b-dropdown-item>
    </b-dropdown>

  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

</style>

<script>
export default {
  data () {
    return {
      isOpened: false,
      selected: this.value,
    };
  },
  props: {
    items: {
      type: Array,
    },
    disabled: {
      type: Boolean,
    },
    value: [String, Number, Object],
    keyProp: {
      type: String,
    },
    disabledProp: {
      type: String,
    },
  },
  methods: {
    selectItem (item) {
      this.selected = item;
      this.$emit('select', item);
    },
  },
};
</script>
