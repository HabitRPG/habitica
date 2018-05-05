<template lang="pug">
div.header-tabs
  .drawer-tab-container
    .drawer-tab(v-for="(tab, index) in tabs")
      a.drawer-tab-text(
        @click="changeTab(index)",
        :class="{'drawer-tab-text-active': selectedTabPosition === index}",
        :title="tab.label"
      ) {{ tab.label }}

  span.right-item
    slot(name="right-item")
</template>

<style lang="scss" scoped>
  .drawer-tab-text {
    overflow-x: hidden;
    display: block;
    text-overflow: ellipsis;
  }

  .drawer-tab {
    white-space: nowrap;
    overflow-x: hidden;
    flex: inherit;
  }

  .drawer-tab-container {
    max-width: 50%;
    margin: 0 auto;
  }

  .right-item {
    position: absolute;
    right: -11px;
    top: -2px;
  }

  .header-tabs {
    position: relative;
    display: flex;
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
