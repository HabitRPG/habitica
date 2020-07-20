<template>
  <div>
    <h3>
      {{ title }}
    </h3>
    <div class="form-group">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'filterGroup',
  props: ['title'],
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h3 {
    height: 1.5rem;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-100;
  }
</style>
