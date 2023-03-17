<template>
  <div class="drawer-container">
    <div
      class="drawer-title"
      :class="{'no-padding': noTitleBottomPadding}"
      @click="toggle()"
    >
      <div class="title-row">
        <slot name="drawer-title-row">
          <div class="text-only">
            {{ title }}
          </div>
        </slot>
      </div>
      <div
        class="drawer-toggle-icon svg-icon icon-10"
        :class="{ closed: !isOpen }"
        v-html="isOpen ? icons.minimize : icons.expand"
      ></div>
    </div>
    <transition
      name="slide-up"
    >
      <div
        v-show="isOpen"
        class="drawer-content"
      >
        <slot name="drawer-header"></slot>
        <div class="drawer-slider">
          <slot name="drawer-slider"></slot>
          <div
            v-if="errorMessage != null"
            class="message"
          >
            <div class="content">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .drawer-container {
    z-index: 19;
    position: fixed;
    font-size: 12px;
    font-weight: bold;
    bottom: 0;
    left: 19%;
    right: 3%;
    max-width: 80%;

    @media screen and (min-width: 1241px) {
      max-width: 978px;
      // 236px is the width of the .standard-sidebar
      left: calc((100% + 236px - 978px) / 2);
      right: 0%;
    }
  }

  .drawer-toggle-icon {
    position: absolute;
    right: 16px;
    bottom: 0;

    &.closed {
      top: 10px;
    }
  }

  .drawer-title {
    height: 2rem;
    position: relative;
    background-color: $gray-10;
    box-shadow: 0 1px 2px 0 rgba($black, 0.2);
    cursor: pointer;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    text-align: center;
    line-height: 1.33;
    color: $white;

    font-size: 12px;
    font-weight: bold;
    display: flex;

    &.no-padding {
      padding-bottom: 0;
    }
  }

  .text-only {
    padding-top: 0.5rem;
  }

  .title-row {
    flex: 1;
    display: flex;
    justify-content: center;

    & > div {
      flex: 1;
    }
  }

  .drawer-content {
    line-height: 1.33;
    max-height: 300px;
    background-color: $gray-50;
    color: $gray-500;
    box-shadow: 0 2px 16px 0 rgba($black, 0.3);
    padding-top: 6px;
    padding-left: 24px;
    padding-right: 24px;
  }

  .drawer-tab {
    &-container {
      display: flex;
      margin-left: 24px;

      & > div {
        flex: 1;
      }
    }

    &-text {
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      color: $white !important;
      text-decoration: none !important;
      border-bottom: 2px solid transparent;
      padding: 0.5rem;

      &-active, &:hover {
        color: $white !important;
        border-color: $purple-400;
      }
    }
  }

  .drawer-help-text {
    cursor: pointer;
    float: right;

    .svg-icon {
      position: relative;
      top: 4px;
      margin-left: 8px;
    }
  }

  .drawer-slider {
    padding: 12px 0 0 8px;
    white-space: nowrap;
    position: relative;

    & .message {
      display: flex;
      align-items: center;
      justify-content: center;

      top: calc(50% - 30px);
      left: 24px;
      right: 0;
      position: absolute;

      & .content {
        background-color: rgba($gray-200, 0.5);
        border-radius: 8px;
        padding: 12px;
      }
    }
  }

  .slide-up-enter-active, .slide-up-leave-active {
    transition-property: all;
    transition-duration: 450ms;
    transition-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }
  .slide-up-enter, .slide-up-leave-to {
    max-height: 0;
  }
</style>

<script>
import expandIcon from '@/assets/svg/expand.svg';
import minimizeIcon from '@/assets/svg/minimize.svg';

export default {
  props: {
    title: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    openStatus: {
      type: Number,
    },
    noTitleBottomPadding: {
      type: Boolean,
    },
  },
  data () {
    return {
      isOpened: true,
      icons: Object.freeze({
        expand: expandIcon,
        minimize: minimizeIcon,
      }),
    };
  },
  computed: {
    isOpen () {
      // Open status is a number so we can tell if the value was passed
      if (this.openStatus !== undefined) return this.openStatus === 1;
      return this.isOpened;
    },
  },
  methods: {
    toggle () {
      this.isOpened = !this.isOpen;
      this.$emit('toggled', this.isOpened);
    },
    open () {
      this.isOpened = true;
      this.$emit('toggled', this.isOpened);
    },
  },
};
</script>
