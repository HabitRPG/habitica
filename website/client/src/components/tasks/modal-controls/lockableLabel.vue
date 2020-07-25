<template>
  <div
    class="d-flex"
    :class="[{ 'opacity-75': locked }, classOverride]"
  >
    <span
      v-if="locked"
      v-once
      class="svg-icon lock-icon icon-10 mr-1"
      :class="classOverride ? classOverride : 'gray-200'"
      v-html="icons.lock"
    >
    </span>
    <label
      v-once
      class="mb-1"
      v-html="text"
    ></label>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  label {
    height: 1.5rem;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    letter-spacing: normal;
  }

  .gray-200 {
    color: $gray-200;
  }

  .lock-icon {
    margin-top: 5px;
  }
</style>

<script>
import lockIcon from '@/assets/svg/lock.svg';

export default {
  props: {
    classOverride: {
      type: String,
    },
    locked: {
      type: Boolean,
    },
    text: {
      type: String,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        lock: lockIcon,
      }),
    };
  },
};
</script>
