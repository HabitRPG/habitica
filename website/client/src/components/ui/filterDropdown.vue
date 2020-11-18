<template>
  <span>
    <span class="dropdown-label">{{ label }}</span>
    <select-list
      :items="items"
      :value="selectedItem"
      class="array-select inline"
      :right="true"
      key-prop="id"
      :hide-icon="false"
      :inline-dropdown="false"
      @select="selectItem($event)"
    >
      <template v-slot:item="{ item }">
        <span :class="{'dropdown-icon-item': withIcon}">
          <slot
            name="item"
            :item="item"
          ></slot>
        </span>
      </template>
    </select-list>
  </span>
</template>

<script>
import SelectList from '@/components/ui/selectList';

export default {
  components: { SelectList },
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
