<template>
  <div>
    <h4 v-if="title">
      {{ title }}
    </h4>
    <div class="form-group">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterGroup',
  props: ['title'],
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h4 {
    min-height: 1.5rem;
  }

  .form-group ::v-deep {
    .form-check {
      margin-bottom: 0.5rem;
    }

    .custom-checkbox {
      // min height for longer labels
      min-height: 1.5rem;
    }
  }
</style>
