<template lang="pug">
.drawer-container(:style="{right: positionRight}")
  .drawer-title(@click="open = !open") {{title}}
  transition(name="slide-up")
    .drawer-content(v-show="open")
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
      | Drawer Content
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.drawer-container {
  z-index: 19;
  position: fixed;
  bottom: 0;
  width: 968px;
  max-width: 90%;
  font-size: 12px;
  font-weight: bold;
}

.drawer-title {
  background-color: $gray-10;
  box-shadow: 0 1px 2px 0 rgba($black, 0.2);
  cursor: pointer;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  text-align: center;
  line-height: 1.67;
  color: $white;
  padding: 6px 0;
}

.drawer-content {
  line-height: 1.33;
  max-height: 160px;
  background-color: $gray-50;
  color: $gray-500;
  box-shadow: 0 2px 16px 0 rgba($black, 0.3);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition-property: all;
  transition-duration: 450ms;
  transition-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);;
}
.slide-up-enter, .slide-up-leave-to {
  max-height: 0;
}
</style>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      open: true,
      positionRight: null,
    };
  },
  mounted () {
    // Center in the middle of the container
    const parentElWith = this.$el.parentElement.offsetWidth;
    const elWidth = this.$el.offsetWidth;
    this.positionRight = `${(parentElWith - elWidth) / 2}px`;
  },
};
</script>