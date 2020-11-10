<template>
  <button
    class="btn btn-flat btn-show-more mb-4"
    @click="$emit('click')"
  >
    <span class="button-text">
      {{ showAll ? $t('showLess') : $t('showMore') }}
    </span>
  </button>
</template>

<script>
export default {
  props: ['showAll'],
};
</script>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .btn-show-more {
    height: 2rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    border-radius: 2px;

    .button-text {
       height: 1.5rem;
       font-size: 14px;
       font-weight: bold;
       line-height: 1.71;
       text-align: center;
       color: $gray-100;
    }

    &:hover {
      .button-text {
        color: $purple-300;
      }
    }
  }
</style>
