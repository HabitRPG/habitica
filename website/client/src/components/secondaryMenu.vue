<template>
  <nav class="nav d-flex justify-content-center secondary-menu">
    <slot></slot>
  </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.secondary-menu {
  background: $gray-600;
  box-shadow: 0 1px 2px 0 rgba($black, 0.2);
  z-index: 9;
  height: 3rem;
  flex-wrap: wrap;

  @media (max-width: 683px) {
    height: auto;
    min-height: 3rem;
  }
}

.nav-link {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.71;
  text-align: center;

  padding: 0.75rem;

  color: $gray-50;
  white-space: nowrap;

  @media (max-width: 683px) {
    padding: 0.5rem;
    font-size: 13px;
    flex: 1 1 auto;
    min-width: fit-content;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.4rem;
    font-size: 12px;
  }

  &.active {
    color: $purple-300;
    box-shadow: 0px -0.25rem 0px $purple-300 inset;
  }

  &:hover {
    background: $gray-500;
  }
}
</style>
