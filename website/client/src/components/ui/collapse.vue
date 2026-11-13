<template>
  <transition
    enter-active-class="collapsing"
    leave-active-class="collapsing"
    @before-enter="setHeight($event, 0)"
    @enter="setHeight($event, $event.scrollHeight)"
    @after-enter="clearHeight"
    @before-leave="setHeight($event, $event.getBoundingClientRect().height)"
    @leave="collapse"
    @after-leave="clearHeight"
  >
    <div
      v-show="visible"
      class="collapse show"
    >
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    setHeight (el, height) {
      el.style.height = `${height}px`;
    },
    collapse (el) {
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.height = 0;
    },
    clearHeight (el) {
      el.style.height = '';
    },
  },
};
</script>
