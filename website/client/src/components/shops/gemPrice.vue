<template>
  <div class="gem-price-div">
    <div
      :class="'mr-2 svg-icon gem icon-' +iconSize"
      v-html="icons.gem"
    ></div>
    <span class="gem-price">{{ gemPrice }}</span>
  </div>
</template>

<script>
import gemIcon from '@/assets/svg/gem.svg';

export default {
  name: 'GemPrice',
  props: ['gemPrice', 'iconSize'],
  data () {
    return {
      icons: Object.freeze({
        gem: gemIcon,
      }),
    };
  },
};
</script>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

.gem-price {
  font-size: 20px;
  font-weight: bold;
  line-height: 1.4;

  color: $gray-50;
}

.gem-price-div {
  display: inline-flex;
  align-items: center;
}
</style>
