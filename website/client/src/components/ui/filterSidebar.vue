<template>
  <div class="filter">
    <slot name="header"></slot>
    <slot name="search"></slot>
    <div class="form">
      <h3
        v-once
        class="filter-label"
      >
        {{ $t('filters') }}
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterSidebar',
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.filter-label {
  min-height: 1.5rem;
  margin-bottom: 0.25rem;
}
</style>
