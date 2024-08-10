<template functional>
  <span
    class="message-count d-flex align-items-center justify-content-center"
    :class="{'top-count': props.top === true, 'top-count-gray': props.gray === true}"
    v-html="props.badge || props.count"
  ></span>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

.message-count {
  background-color: $red-50;
  border-radius: 50%;
  color: $white;
  font-size: 12px;
  font-weight: bold;
  height: 20px;
  left: 24px;
  text-align: center;
  width: 20px;

  svg {
    width: 12px;
    height: 12px;
  }
}

.message-count.top-count {
  position: absolute;
  right: 0.3em;
  top: -0.8em;
  padding: 0.2em;
}

.message-count.top-count-gray {
  background-color: $gray-200;
}

@media only screen and (max-width: 992px) {

  .message-count {
    left: 12px;
  }
}
</style>
