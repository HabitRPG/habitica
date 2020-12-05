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
      <SidebarButton
        :visible="visible"
        @click="toggle"
      />
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
    /* To have the divider full width */
    margin-right: -1.5rem;
    margin-left: -1.5rem;

    /* change back the content padding*/
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    margin-top: 1em;
    padding-top: 0.688em;
  }

  .section:last-of-type {
    border-bottom: 1px solid #e1e0e3;
    margin-bottom: 1em;
    padding-bottom: 1em;
  }

  .section-body {
    margin-top: 0.75em;
  }

  .section-info {
    cursor: help;
  }

  .section-info .svg-icon {
    width: 16px;
  }
</style>

<script>
import { v4 as uuid } from 'uuid';
import SidebarButton from './sidebarButton';
import informationIcon from '@/assets/svg/information.svg';

export default {
  components: { SidebarButton },
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
