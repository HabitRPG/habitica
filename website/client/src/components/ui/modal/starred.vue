<template>
  <section class="d-flex">
    <span
      class="star-group mirror"
      v-html="icons.starGroup"
    ></span>
    <slot></slot>
    <span
      class="star-group"
      v-html="icons.starGroup"
    ></span>
  </section>
</template>

<style lang="scss">
  .mirror {
    transform: scaleX(-1);
  }

  .star-group {
    margin: auto;

    svg {
      height: 4rem;
      width: 2.5rem;
    }
  }
</style>

<script>
import starGroup from '@/assets/svg/star-group.svg';

export default {
  data () {
    return {
      icons: Object.freeze({ starGroup }),
    };
  },
};
</script>
