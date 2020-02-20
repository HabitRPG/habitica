<template>
  <span>
    <span class="dropdown-label">{{ label }}</span>
    <b-dropdown right="right">
      <span
        slot="button-content"
        :class="{'dropdown-icon-item': withIcon}"
      >
        <slot
          name="item"
          :item="selectedItem"
        ></slot>
      </span>
      <b-dropdown-item
        v-for="item in items"
        :key="item.id"
        :active="selectedItem.id === item.id"
        @click="selectItem(item)"
      >
        <span :class="{'dropdown-icon-item': withIcon}">
          <slot
            name="item"
            :item="item"
          ></slot>
        </span>
      </b-dropdown-item>
    </b-dropdown>
  </span>
</template>

<script>
export default {
  props: {
    label: String,
    items: Array,
    initialItem: Object,
    withIcon: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      selectedItem: this.initialItem,
    };
  },
  methods: {
    selectItem (item) {
      this.selectedItem = item;
      this.$emit('selected', item);
    },
  },
};
</script>

<style scoped lang="scss">

</style>
