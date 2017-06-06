<template lang="pug">
.svg-icon(v-html="icons[name]")
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
// Each icon entry is an array of [name, path (relative to website/client/assets, without .svg)]
const iconsDefs = [
  ['gem', 'header/gem'],
  ['gold', 'header/gold'],
  ['notifications', 'header/notifications'],
  ['user', 'header/user'],
];

const icons = {};
iconsDefs.map(([icn, path]) => {
  icons[icn] = require(`!svg-inline-loader!assets/${path}.svg`); // eslint-disable-line global-require
});

export default {
  props: ['name'],
  data () {
    return Object.freeze({
      icons,
    });
  },
};
</script>