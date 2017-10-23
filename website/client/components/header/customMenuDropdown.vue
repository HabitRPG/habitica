<!-- 
A simplified dropdown component that doesn't rely on buttons as toggles  like bootstrap-vue
-->

<template lang="pug">
.habitica-menu-dropdown.item-with-icon.dropdown(@click="toggleDropdown()", :class="{open: isDropdownOpen}")
  .habitica-menu-dropdown-toggle
    slot(name="dropdown-toggle")
  .dropdown-menu.dropdown-menu-right
    slot(name="dropdown-content")
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.habitica-menu-dropdown.open {
  .habitica-menu-dropdown-toggle .svg-icon {
    color: $white !important;
  }
}
</style>
<style lang='scss' scoped>
@import '~client/assets/scss/colors.scss';

.dropdown {
  &:hover {
    cursor: pointer;
  }

  & + .dropdown {
    margin-left: 0px;
  }

  .dropdown-menu {
    cursor: auto;
  }

  &.open {
    .dropdown-menu {
      display: block;
      margin-top: 12px;
    }
  }
}
</style>

<script>
export default {
  data () {
    return {
      isDropdownOpen: false,
    };
  },
  mounted () {
    document.documentElement.addEventListener('click', this._clickOutListener);
  },
  destroyed () {
    document.removeEventListener('click', this._clickOutListener);
  },
  methods: {
    _clickOutListener (e) {
      if (!this.$el.contains(e.target) && this.isDropdownOpen) {
        this.toggleDropdown();
      }
    },
    toggleDropdown () {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
  },
};
</script>
