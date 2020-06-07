<!--
A simplified dropdown component that doesn't rely on buttons as toggles  like bootstrap-vue
-->

<template>
  <div
    class="habitica-menu-dropdown dropdown"
    role="button"
    tabindex="0"
    :class="{open: isOpen}"
    :aria-pressed="isPressed"
    @click="toggleDropdown()"
    @keypress.enter.space.stop.prevent="toggleDropdown()"
  >
    <div class="habitica-menu-dropdown-toggle">
      <slot name="dropdown-toggle"></slot>
    </div>
    <div
      class="dropdown-menu"
      :class="{'dropdown-menu-right': right}"
    >
      <slot name="dropdown-content"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';
.habitica-menu-dropdown {
  &:hover,
  &:focus { // NB focus styles match the hover styles for .svg-icon
    outline: none;
  }

  &.open {
    .habitica-menu-dropdown-toggle .svg-icon {
      color: $white !important;
    }
  }
}
</style>
<style lang='scss' scoped>
@import '~@/assets/scss/colors.scss';

.dropdown {
  &:hover {
    cursor: pointer;
  }

  .dropdown-menu {
    cursor: auto;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    left: inherit;
    right: 0px !important;

    ::v-deep .dropdown-separated {
      border-bottom: 1px solid $gray-500;
    }
  }

  &.open {
    .dropdown-menu {
      display: block;
      margin-top: 8px;
    }
  }
}
</style>

<script>
export default {
  props: {
    right: Boolean,
    openStatus: Number,
  },
  data () {
    return {
      isDropdownOpen: false,
    };
  },
  computed: {
    isOpen () {
      // Open status is a number so we can tell if the value was passed
      if (this.openStatus !== undefined) return this.openStatus === 1;
      return this.isDropdownOpen;
    },
    isPressed () {
      return this.isOpen ? 'true' : 'false';
    },
  },
  mounted () {
    document.documentElement.addEventListener('click', this._clickOutListener);
  },
  beforeDestroy () {
    document.removeEventListener('click', this._clickOutListener);
  },
  methods: {
    _clickOutListener (e) {
      if (!this.$el.contains(e.target) && this.isOpen) {
        this.toggleDropdown();
      }
    },
    toggleDropdown () {
      this.isDropdownOpen = !this.isOpen;
      this.$emit('toggled', this.isDropdownOpen);
    },
  },
};
</script>
