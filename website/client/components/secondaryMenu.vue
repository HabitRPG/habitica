<template lang="pug">
nav.nav.d-flex.justify-content-center.secondary-menu
  slot
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.secondary-menu {
  background: $gray-600;
  margin-left: -15px;
  margin-right: -15px;
  box-shadow: 0 1px 2px 0 rgba($black, 0.2);
}

.nav-link {
  font-size: 16px;
  line-height: 1.5;
  padding: 16px 24px;
  font-weight: bold;
  color: $gray-50;

  &.active {
    color: $purple-200;
    box-shadow: 0px -4px 0px $purple-300 inset;
  }

  &:hover {
    background: $gray-500;
  }
}
</style>