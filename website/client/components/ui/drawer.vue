<template lang="pug">
.drawer-container
  .drawer-title(@click="toggle()")
    | {{title}}
    .drawer-toggle-icon.svg-icon.icon-10(v-html="isOpen ? icons.minimize : icons.expand", :class="{ closed: !isOpen }")
  transition(name="slide-up", @afterLeave="adjustPagePadding", @afterEnter="adjustPagePadding")
    .drawer-content(v-show="isOpen")
      slot(name="drawer-header")
      .drawer-slider
        slot(name="drawer-slider")
        div.message(v-if="errorMessage != null")
          .content {{ errorMessage }}
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

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
    top: 16px;

    &.closed {
      top: 10px;
    }
  }

  .drawer-title {
    position: relative;
    background-color: $gray-10;
    box-shadow: 0 1px 2px 0 rgba($black, 0.2);
    cursor: pointer;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    text-align: center;
    line-height: 1.67;
    color: $white;
    padding: 6px 0;
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
      line-height: 1.67;
      text-align: center;
      color: $white;
      border-bottom: 2px solid transparent;
      padding: 0px 8px 8px 8px;

      &-active {
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
import expandIcon from 'assets/svg/expand.svg';
import minimizeIcon from 'assets/svg/minimize.svg';

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
    },
    openStatus: {
      type: Number,
    },
  },
  data () {
    return {
      open: true,
      icons: Object.freeze({
        expand: expandIcon,
        minimize: minimizeIcon,
      }),
    };
  },
  computed: {
    isOpen () {
      // Open status is a number so we can tell if the value was passed
      if (this.openStatus !== undefined) return this.openStatus === 1 ? true : false;
      return this.open;
    },
  },
  methods: {
    adjustPagePadding () {
      let minPaddingBottom = 20;
      let drawerHeight = this.$el.offsetHeight;
      let standardPage = document.getElementsByClassName('standard-page')[0];
      standardPage.style.paddingBottom = `${drawerHeight + minPaddingBottom}px`;
    },
    toggle () {
      this.open = !this.isOpen;
      this.$emit('toggled', this.open);
    },
  },
  mounted () {
    // Make sure the page has enough space so the drawer does not overlap content
    this.adjustPagePadding();
  },
};
</script>
