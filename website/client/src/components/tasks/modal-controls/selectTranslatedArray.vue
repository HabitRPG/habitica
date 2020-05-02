<template>
  <div>
    <select-list :items="items"
                 :value="selected"
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
