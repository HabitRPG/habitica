<template lang="pug">
  div
    .svg-icon(v-if="withHourglass",v-html="icons.hourglasses")
    span(v-if="withHourglass") {{userHourglasses | roundBigNumber}}

    .svg-icon(v-html="icons.gem")
    span {{userGems | roundBigNumber}}
    .svg-icon(v-html="icons.gold")
    span {{userGold | roundBigNumber}}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

span {
  font-weight: normal;
  font-size: 12px;
  line-height: 1.33;
  color: $gray-200;

  display: inline-block;
}

.svg-icon {
  vertical-align: middle;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  margin-left: 4px;

  display: inline-block;
}

</style>

<script>
  import { mapState, mapGetters } from 'client/libs/store';
  import svgGem from 'assets/svg/gem.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgHourglasses from 'assets/svg/hourglass.svg';

  export default {
    data () {
      return {
        icons: Object.freeze({
          gem: svgGem,
          gold: svgGold,
          hourglasses: svgHourglasses,
        }),
      };
    },
    computed: {
      ...mapGetters({
        userGems: 'user:gems',
      }),
      ...mapState({
        userHourglasses: 'user.data.purchased.plan.consecutive.trinkets',
        userGold: 'user.data.stats.gp',
      }),
    },
    props: {
      withHourglass: {
        type: Boolean,
      },
    },
  };
</script>
