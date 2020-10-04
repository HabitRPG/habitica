<template>
  <div class="filter">
    <slot name="header"></slot>
    <slot name="search"></slot>
    <div class="form">
      <h2 v-once class="filter-label">
        {{ $t('filters') }}
      </h2>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'filterSidebar',
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.filter-label {
  font-family: Roboto, sans-serif;
  height: 1.5rem;
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.71;
  letter-spacing: normal;
  color: $gray-10;
  margin-bottom: 0.25rem;
}
</style>
