<template lang="pug">
  div
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
  import gemIcon from 'assets/svg/gem.svg';
  import goldIcon from 'assets/svg/gold.svg';

  export default {
    data () {
      return {
        icons: Object.freeze({
          gem: gemIcon,
          gold: goldIcon,
        }),
      };
    },
    computed: {
      ...mapGetters({
        userGems: 'user:gems',
      }),
      ...mapState({
        userGold: 'user.data.stats.gp',
      }),
    },
  };
</script>
