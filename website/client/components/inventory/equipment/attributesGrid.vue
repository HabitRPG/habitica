<template lang="pug">
  div.attributes-group
    .popover-content-attr(v-for="attr in ATTRIBUTES", :key="attr")
      .group-content
        span.popover-content-attr-cell.key(:class="{'hasValue': hasSumValue(attr) }") {{ `${$t(attr)}: ` }}
        span.popover-content-attr-cell.label.value(:class="{'green': hasSumValue(attr) }") {{ `${stats.sum[attr]}` }}
        span.popover-content-attr-cell.label.bold(:class="{'hasValue': hasGearValue(attr) }") Gear:
        span.popover-content-attr-cell.label(:class="{'hasValue': hasGearValue(attr) }") {{ stats.gear[attr] }}
        span.popover-content-attr-cell.label.bold(:class="{'hasValue': hasClassBonus(attr) }") Bonus:
        span.popover-content-attr-cell.label(:class="{'hasValue': hasClassBonus(attr) }") {{ `${stats.classBonus[attr]}` }}
</template>

<style lang="scss" scoped>

  @import '~client/assets/scss/colors.scss';

</style>

<script>
  import { mapState } from 'client/libs/store';
  import statsMixin from 'client/mixins/stats';

  export default {
    mixins: [statsMixin],
    props: {
      item: {
        type: Object,
      },
    },
    computed: {
      ...mapState({
        ATTRIBUTES: 'constants.ATTRIBUTES',
        user: 'user.data',
        flatGear: 'content.gear.flat',
      }),
    },
    methods: {

      hasSumValue (attr) {
        return this.stats.sum[attr] > 0;
      },
      hasGearValue (attr) {
        return this.stats.gear[attr] > 0;
      },
      hasClassBonus (attr) {
        return this.stats.classBonus[attr] > 0;
      },
    }
  };
</script>
