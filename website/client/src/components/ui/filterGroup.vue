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
    font-family: Roboto, sans-serif;
    height: 1.5rem;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    letter-spacing: normal;
    color: $gray-100;
  }

  .form-group ::v-deep {
    .form-check {
      margin-bottom: 0.5rem;
    }

    .custom-checkbox {
      height: 1.5rem;
    }
  }
</style>
