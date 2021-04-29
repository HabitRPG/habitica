<template>
  <div v-once class="your-rewards d-flex">
    <span
      class="sparkles"
      v-html="icons.sparkles"
    ></span>
    <span class="text">{{ $t('yourRewards') }}</span>
    <span
      class="sparkles mirror"
      v-html="icons.sparkles"
    ></span>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .mirror {
    transform: scaleX(-1);
  }

  .your-rewards {
    min-height: 0;
    margin: 0 auto;
    width: fit-content;

    .sparkles {
      width: 2rem;
      margin-top: .75rem;
    }

    .text {
      min-height: 0;
      font-weight: bold;
      margin: 1rem;
      color: $gray-50;
    }
  }
</style>

<script>
import sparkles from '@/assets/svg/sparkles-left.svg';

export default {
  data () {
    return {
      icons: Object.freeze({ sparkles }),
    };
  },
};
</script>
