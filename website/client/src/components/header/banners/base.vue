<template>
  <div
    v-if="canShow"
    class="habitica-top-banner d-flex justify-content-between align-items-center"
    :class="bannerClass"
    :style="{height}"
  >
    <slot name="content"></slot>
    <div
      v-if="canClose"
      class="close-icon svg-icon icon-12"

      @click="close()"
      v-html="icons.close"
    ></div>
  </div>
</template>

<style lang="scss">
body.modal-open .habitica-top-banner {
  z-index: 1035;
}
</style>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.habitica-top-banner {
  width: 100%;
  padding-left: 1.5rem;
  padding-right: 1.625rem;
  z-index: 1300;
}

.close-icon.svg-icon {
  position: relative;
  top: 0;
  right: 0;
  opacity: 0.48;

  & ::v-deep svg path {
    stroke: $white !important;
  }

  &:hover {
    opacity: 0.75;
  }
}
</style>

<script>
import closeIcon from '@/assets/svg/close.svg';
import {
  clearBannerSetting, hideBanner, isBannerHidden, updateBannerHeight,
} from '@/libs/banner.func';
import { EVENTS } from '@/libs/events';

export default {
  props: {
    bannerId: {
      type: String,
      required: true,
    },
    bannerClass: {
      type: String,
      default: '',
    },
    canClose: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      default: true,
    },
    // Used to correctly show the layout on certain pages with a fixed height
    // Like the PMs page
    height: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
      hidden: false,
    };
  },
  computed: {
    canShow () {
      return !this.hidden && this.show;
    },
  },
  watch: {
    canShow: {
      handler (newVal) {
        const valToSet = newVal === true ? this.height : '0px';
        updateBannerHeight(this.bannerId, valToSet);
        this.$root.$emit(EVENTS.BANNER_HEIGHT_UPDATED);
      },
      immediate: true,
    },
    show (newVal) {
      // When the show condition is set to false externally, remove the session storage setting
      if (newVal === false) {
        clearBannerSetting(this.bannerId);
        this.hidden = false;
      }
    },
  },
  mounted () {
    if (isBannerHidden(this.bannerId)) {
      this.hidden = true;
    }
  },
  methods: {
    close () {
      hideBanner(this.bannerId);
      this.hidden = true;

      this.$root.$emit(EVENTS.BANNER_HIDDEN, this.bannerId);
    },
  },
};
</script>
