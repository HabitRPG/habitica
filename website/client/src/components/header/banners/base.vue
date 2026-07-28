<template>
  <div
    v-if="canShow"
    class="habitica-top-banner d-flex justify-content-between align-items-center"
    :class="bannerClass"
    :style="{height}"
  >
    <slot name="content"></slot>
    <close-x
      v-if="canClose"
      @close="close()"
    />
    <div v-else
      class="right-spacer"
    >
    </div>
  </div>
</template>

<style lang="scss">
body.modal-open .habitica-top-banner {
  z-index: 1035;
}
</style>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.habitica-top-banner {
  width: 100%;
  padding-left: 56px;
  z-index: 1300;

  .modal-close {
    margin-left: 16px;
    margin-right: 16px;
    position: unset;
  }

  .right-spacer {
    width: 56px;
  }
}
</style>

<script>
import closeX from '@/components/ui/closeX';
import {
  clearBannerSetting, hideBanner, isBannerHidden, updateBannerHeight,
} from '@/libs/banner.func';
import { EVENTS } from '@/libs/events';

export default {
  components: {
    closeX,
  },
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
    },
  },
};
</script>
