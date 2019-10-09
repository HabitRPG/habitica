<template lang="pug">
.header-tabs
  ul.drawer-tab-container
    li.drawer-tab(v-for="(tab, index) in tabs")
      a.drawer-tab-text(
        @click="changeTab(index)",
        :class="{'drawer-tab-text-active': selectedTabPosition === index}",
        :title="tab.label"
      ) {{ tab.label }}

  aside.help-item
    slot(name="right-item")
</template>

<style lang="scss" scoped>
  .drawer-tab-text {
    display: block;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .drawer-tab {
    flex: inherit;
    overflow-x: hidden;
    white-space: nowrap;
  }

  .drawer-tab-container {
    grid-column-start: 2;
    grid-column-end: 3;
    justify-self: center;
    margin: 0;
    padding: 0;
  }

  .help-item {
    grid-column-start: 3;
    position: relative;
    right: -11px;
    text-align: right;
    top: -2px;
  }

  .header-tabs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }

  // MS Edge
  @supports (-ms-ime-align: auto) {
    .help-item {
      align-self: center;
      top: 1px;
    }
  }
</style>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      selectedTabPosition: 0,
    };
  },
  methods: {
    changeTab (newIndex) {
      this.selectedTabPosition = newIndex;
      this.$emit('changedPosition', newIndex);
    },
  },
};
</script>
