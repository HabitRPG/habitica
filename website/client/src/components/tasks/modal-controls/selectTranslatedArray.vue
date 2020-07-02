<template>
  <div>
    <select-list :items="items"
                 :value="selected"
                 class="array-select"
                 :disabled="disabled"
                 @select="selectItem($event)">
      <template v-slot:item="{ item }">
          <span class="label">{{ $t(item) }}</span>
      </template>
    </select-list>
  </div>
</template>

<style lang="scss" scoped>
</style>

<style lang="scss">
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
  props: {
    items: {
      type: Array,
    },
    disabled: {
      type: Boolean,
    },
    value: [String, Number, Object],
  },
};
</script>
