<template lang="pug">
span
  span.dropdown-label {{ label }}
  b-dropdown(right=true)
    span(slot="text", :class="{'dropdown-icon-item': withIcon}")
      slot(name="item", :item="selectedItem")

    b-dropdown-item(
      v-for="item in items",
      @click="selectItem(item)",
      :active="selectedItem.id === item.id",
      :key="item.id"
    )
      span(:class="{'dropdown-icon-item': withIcon}")
        slot(name="item", :item="item")
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
