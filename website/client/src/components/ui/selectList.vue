<template>
  <div>
    <b-dropdown
      class="inline-dropdown"
      :toggle-class="isOpened ? 'active' : null"
      :disabled="disabled"
      @show="isOpened = true"
      @hide="isOpened = false"
    >
      <template v-slot:button-content>
        <slot
          name="item"
          :item="selected"
          :button="true"
        >
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
        <slot
          name="item"
          :item="item"
          :button="false"
        >
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
  data () {
    return {
      isOpened: false,
      selected: this.value,
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
