<template lang="pug" functional>
span.message-count(:class="{'top-count': props.top === true}") {{props.count}}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.message-count {
  background-color: $blue-50;
  border-radius: 50%;
  height: 20px;
  width: 20px;
  float: right;
  color: $white;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
}

.message-count.top-count {
  position: absolute;
  right: 0.3em;
  top: -0.8em;
  padding: 0.2em;
  background-color: $red-50;
}
</style>