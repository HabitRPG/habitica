<template>
  <div
    v-once
    class="gem-price-div"
    :class="{'background': withBackground}"
  >
    <div
      :class="`mr-2 svg-icon gem icon-${iconSize}`"
      v-html="icons.gem"
    ></div>
    <span class="gem-price">{{ gemPrice }}</span>
  </div>
</template>

<script>
import gemIcon from '@/assets/svg/gem.svg';

export default {
  name: 'GemPrice',
  props: ['gemPrice', 'iconSize', 'withBackground'],
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

  color: $green-10;
}

.gem-price-div {
  display: inline-flex;
  align-items: center;
}

.background {
  align-self: center;
  border-radius: 20px;
  padding: 6px 20px;

  background-color: rgba($green-100, 0.15);
}
</style>
