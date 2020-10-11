<template>
  <button
    class="toggle ml-auto"
    @click="$emit('click')"
  >
    <span
      v-if="visible"
      class="svg-icon"
      v-html="icons.upIcon"
    ></span>
    <span
      v-else
      class="svg-icon"
      v-html="icons.downIcon"
    ></span>
  </button>
</template>

<style lang="scss" scoped>
.toggle {
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .svg-icon {
    width: 16px;
  }
</style>

<script>
import upIcon from '@/assets/svg/up.svg';
import downIcon from '@/assets/svg/down.svg';

export default {
  props: {
    visible: {
      required: true,
    },
  },
  data () {
    return {
      icons: {
        upIcon,
        downIcon,
      },
    };
  },
};
</script>
