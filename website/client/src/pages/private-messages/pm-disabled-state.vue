<template>
  <div
    class="pm-disabled-caption text-center"
  >
    <h4>{{ disabledTexts.title }}</h4>
    <p>{{ disabledTexts.description }}</p>
  </div>
</template>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

.pm-disabled-caption {
  padding-top: 1.5em;
  z-index: 2;

  h4, p {
    color: $gray-200;
  }

  h4 {
    margin-top: 0;
    margin-bottom: 0.4em;
  }

  p {
    font-size: 12px;
    margin-bottom: 0;
  }
}
</style>

<script>
export default {
  props: ['disabledTexts'],
};
</script>
