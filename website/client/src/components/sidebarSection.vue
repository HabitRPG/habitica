<template>
  <div class="section">
    <div class="section-header d-flex align-items-center">
      <h3
        v-once
        class="mb-0"
      >
        {{ title }}
      </h3>
      <div
        v-if="tooltip !== null"
        class="section-info mx-1"
      >
        <div
          :id="tooltipId"
          class="svg-icon"
          :title="tooltip"
          v-html="icons.information"
        ></div>
        <b-tooltip
          :title="tooltip"
          :target="tooltipId"
        />
      </div>
      <div
        class="section-toggle ml-auto"
        @click="toggle"
      >
        <div
          v-if="visible"
          class="svg-icon"
          v-html="icons.upIcon"
        ></div>
        <div
          v-else
          class="svg-icon"
          v-html="icons.downIcon"
        ></div>
      </div>
    </div>
    <div
      v-show="visible"
      class="section-body"
    >
      <slot></slot>
    </div>
  </div>
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
import upIcon from '@/assets/svg/up.svg';
import downIcon from '@/assets/svg/down.svg';
import informationIcon from '@/assets/svg/information.svg';

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
