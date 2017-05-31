<template lang="pug">
svg.svg-icon
  use(:xlink:href="`#icon-${name}`")
</template>

<style lang="scss">
.svg-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
  transition: none;
}
</style>

<script>
export default {
  props: ['name'],
};
</script>