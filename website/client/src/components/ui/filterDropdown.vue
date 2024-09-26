<template>
  <span>
    <span class="dropdown-label">{{ label }}</span>
    <select-list
      :items="items"
      :value="selectedItem"
      class="array-select inline"
      :right="true"
      :hide-icon="false"
      :inline-dropdown="false"
      :direct-select="directSelect"
      @select="selectItem($event)"
    >
      <template #item="{ item }">
        <span
        v-if="withIcon"
        :class="{'dropdown-icon-item': withIcon}"
        id="with-icon"
        >
          <slot
            name="item"
            :item="item"
          ></slot>
        </span>
        <span
          v-else
        >
          <slot
            name="item"
            :item="item"
          >
          </slot>

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
    directSelect: {
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
#with-icon {
  line-height: 1;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

</style>
