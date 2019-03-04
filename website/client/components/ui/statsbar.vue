<template lang="pug">
  .progress-container(ref="container", :id="elementId", :class="{condensed}")
    .svg-icon(v-html="icon")
    .progress
      .progress-bar(:class="progressClass", :style="{width: `${percent(value, maxValue)}%`}")
    span.small-text {{value | statFloor}} / {{maxValue}}
    b-tooltip.myClass(:target="() => $refs.container", :container="elementId", :title="tooltip", triggers="hover", placement="bottom")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .progress-container {
    margin-left: 4px;
    margin-bottom: .5em;
    height: 24px;

    /deep/ .bs-tooltip-bottom {
      top: -16px !important
    }
  }

  .progress-container > span {
    color: $header-color;
    margin-left: 8px;
    font-style: normal;
    line-height: 1;
  }

  .progress-container > .svg-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }

  .progress-container > .progress {
    min-width: 200px;
    margin: 0px;
    border-radius: 1px;
    height: 12px;
    background-color: $header-dark-background;
  }

  .progress-container > .progress > .progress-bar {
    border-radius: 1px;
    height: 12px;
    min-width: 0px;
  }

  .progress-container .svg-icon, .progress-container .progress, .progress-container .small-text {
    display: inline-block;
    vertical-align: middle;
  }

  .progress-container.condensed {
    > .svg-icon {
      width: 19px;
      height: 19px;
      margin-top: -2px;
    }

     > .progress {
      width: 152px;
      border-radius: 1px;
      height: 10px;
      margin-top: 2px;
      background: $purple-100;
    }

    > .progress > .progress-bar {
      border-radius: 1px;
      height: 10px;
    }
  }
</style>

<script>
  import percent from '../../../common/script/libs/percent';

  export default {
    props: {
      icon: {
        type: String,
      },
      value: {
        type: Number,
      },
      maxValue: {
        type: Number,
      },
      tooltip: {
        type: String,
      },
      progressClass: {
        type: String,
      },
      condensed: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        elementId: null,
      };
    },
    filters: {
      statFloor (value) {
        if (value < 1 && value > 0) {
          return Math.ceil(value * 10) / 10;
        } else {
          return Math.floor(value);
        }
      },
    },
    methods: {
      percent,
      click () {
        this.$emit('click');
      },
    },
    mounted () {
      this.elementId = `container_${this._uid}`;
    },
  };
</script>
