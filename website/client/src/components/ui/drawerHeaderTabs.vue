<template>
  <div class="header-tabs">
    <div class="drawer-tab-container">
      <navbar
        class="drawer"
        :items="tabs"
        :active="tabs[selectedTabPosition]"
        :no-translate="noTranslate"
        @change="changeTab"
      />
    </div>
    <aside class="help-item">
      <slot name="right-item"></slot>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
  .drawer-tab-container {
    grid-column-start: 2;
    grid-column-end: 3;
    justify-self: center;
    margin: 0;
    padding: 0;
  }

  .help-item {
    grid-column-start: 3;
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
import Navbar from '@/components/ui/simpleNavbar';

export default {
  components: {
    Navbar,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },

    active: {
      type: Number,
      default: 0,
    },

    noTranslate: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      selectedTabPosition: 0,
    };
  },
  watch: {
    active: {
      immediate: true,
      handler (value) {
        this.selectedTabPosition = value;
      },
    },
  },
  methods: {
    changeTab (tab, newIndex) {
      this.selectedTabPosition = newIndex;
      this.$emit('changedPosition', newIndex);
    },
  },
};
</script>
