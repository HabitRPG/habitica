<template>
  <span class="ml-1">
    <div
      :id="`tooltip_${tooltipId}`"
      class="svg-icon icon-16"
      :title="tooltip"
      v-html="icons.information"
    ></div>
    <b-tooltip
      :title="tooltip"
      :target="`tooltip_${tooltipId}`"
    />
  </span>
</template>

<style lang="scss" scoped>
  span {
    display: inline-block;
    vertical-align: middle;
  }
</style>

<script>
import informationIcon from '@/assets/svg/information.svg';

export default {
  name: 'InformationIcon',
  props: ['tooltipId', 'tooltip'],
  data () {
    return {
      icons: Object.freeze({
        information: informationIcon,
      }),
    };
  },
};
</script>
