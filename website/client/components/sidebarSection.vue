<template lang="pug">
  .section
      .section-header.d-flex.align-items-center
        h3.mb-0(v-once)
          | {{ title }}
        .section-info.mx-1(
          v-if="tooltip !== null"
        )
          .svg-icon(
            v-html='icons.information',
            :id="tooltipId",
            :title="tooltip"
          )
          b-tooltip(
            :title="tooltip",
            :target="tooltipId",
          )
        .section-toggle.ml-auto(@click="toggle")
          .svg-icon(v-html="icons.upIcon", v-if="visible")
          .svg-icon(v-html="icons.downIcon", v-else)
      .section-body(v-show="visible")
        slot
</template>

<style lang="scss" scoped>
  .section {
    border-top: 1px solid #e1e0e3;
    margin-top: 1em;
    padding-top: 1em;
  }

  .section:last-of-type {
    border-bottom: 1px solid #e1e0e3;
    margin-bottom: 1em;
    padding-bottom: 1em;
  }

  .section-body {
    margin-top: 1em;
  }

  .section-toggle {
    cursor: pointer;
  }

  .section-info {
    cursor: help;
  }

  .section-info .svg-icon,
  .section-toggle .svg-icon {
    width: 16px;
  }
</style>

<script>
  import uuid from 'uuid/v4';
  import upIcon from 'assets/svg/up.svg';
  import downIcon from 'assets/svg/down.svg';
  import informationIcon from 'assets/svg/information.svg';

  export default {
    props: {
      title: {
        required: true,
      },
      tooltip: {
        default: null,
      },
      show: {
        default: true,
      },
    },
    data () {
      return {
        tooltipId: uuid(),
        visible: this.show,
        icons: {
          upIcon,
          downIcon,
          information: informationIcon,
        },
      };
    },
    methods: {
      toggle () {
        this.visible = !this.visible;
      },
    },
  };
</script>