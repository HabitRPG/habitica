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
        document.documentElement.style
          .setProperty(`--banner-${this.bannerId}-height`, valToSet);
      },
      immediate: true,
    },
    show (newVal) {
      // When the show condition is set to false externally, remove the session storage setting
      if (newVal === false) {
        window.sessionStorage.removeItem(`hide-banner-${this.bannerId}`);
        this.hidden = false;
      }
    },
  },
  mounted () {
    const hideStatus = window.sessionStorage.getItem(`hide-banner-${this.bannerId}`);
    if (hideStatus === 'true') {
      this.hidden = true;
    }
  },
  methods: {
    close () {
      window.sessionStorage.setItem(`hide-banner-${this.bannerId}`, 'true');
      this.hidden = true;
    },
  },
};
</script>
