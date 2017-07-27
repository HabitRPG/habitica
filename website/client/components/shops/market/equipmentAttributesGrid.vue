<template lang="pug">
  div
    .attribute-entry(v-for="attr in ATTRIBUTES", :key="attr")
      span.key(:class="{'no-value': item[attr] == '0'}") {{ `${$t(attr)}: ` }}
      span.val(:class="{'no-value': item[attr] == '0'}") {{ `+${item[attr]}` }}
</template>

<style lang="scss" scoped>

  @import '~client/assets/scss/colors.scss';

  .attribute-entry {
    width: 50%;
    display: inline-block;
    font-weight: bold;
    margin-bottom: 16px;
  }

  span{
    width: 38px;
    height: 16px;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.0;
  }

  .no-value {
    color: $gray-400 !important;
  }

  .key {
    color: $gray-100;
  }

  .val {
    color: $green-10;
  }
</style>

<script>
  import { mapState } from 'client/libs/store';

  export default {
    props: {
      item: {
        type: Object,
      },
    },
    computed: {
      ...mapState({
        ATTRIBUTES: 'constants.ATTRIBUTES',
      }),
    },
  };
</script>
