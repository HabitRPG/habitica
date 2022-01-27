<template>
  <base-banner
    banner-id="gems-promo"
    :banner-class="bannerClass"
    :show="showGemsPromoBanner"
    height="3rem"
  >
    <div
      slot="content"
      :aria-label="$t('gems')"
      class="content d-flex justify-content-around align-items-center"
      @click="openGemsModal"
    >
      <img
        v-if="eventName === 'fall_extra_gems'"
        class="d-none d-xl-block"
        srcset="
    ~@/assets/images/gems/fall-confetti-left/confetti.png,
    ~@/assets/images/gems/fall-confetti-left/confetti@2x.png 2x,
    ~@/assets/images/gems/fall-confetti-left/confetti@3x.png 3x"
        src="~@/assets/images/gems/fall-confetti-left/confetti.png"
      >
      <img
        v-else-if="eventName === 'spooky_extra_gems'"
        class="d-none d-xl-block"
        srcset="
    ~@/assets/images/gems/spooky-confetti-left/confetti.png,
    ~@/assets/images/gems/spooky-confetti-left/confetti@2x.png 2x,
    ~@/assets/images/gems/spooky-confetti-left/confetti@3x.png 3x"
        src="~@/assets/images/gems/spooky-confetti-left/confetti.png"
      >
      <div class="promo-test">
        <img
          v-if="eventName === 'fall_extra_gems'"
          srcset="
      ~@/assets/images/gems/fall-text/text.png,
      ~@/assets/images/gems/fall-text/text@2x.png 2x,
      ~@/assets/images/gems/fall-text/text@3x.png 3x"
          src="~@/assets/images/gems/fall-text/text.png"
        >
        <img
          v-else-if="eventName === 'spooky_extra_gems'"
          srcset="
      ~@/assets/images/gems/spooky-text/text.png,
      ~@/assets/images/gems/spooky-text/text@2x.png 2x,
      ~@/assets/images/gems/spooky-text/text@3x.png 3x"
          src="~@/assets/images/gems/spooky-text/text.png"
        >
      </div>
      <img
        v-if="eventName === 'fall_extra_gems'"
        class="d-none d-xl-block"
        srcset="
    ~@/assets/images/gems/fall-confetti-right/confetti.png,
    ~@/assets/images/gems/fall-confetti-right/confetti@2x.png 2x,
    ~@/assets/images/gems/fall-confetti-right/confetti@3x.png 3x"
        src="~@/assets/images/gems/fall-confetti-right/confetti.png"
      >
      <img
        v-else-if="eventName === 'spooky_extra_gems'"
        class="d-none d-xl-block"
        srcset="
    ~@/assets/images/gems/spooky-confetti-right/confetti.png,
    ~@/assets/images/gems/spooky-confetti-right/confetti@2x.png 2x,
    ~@/assets/images/gems/spooky-confetti-right/confetti@3x.png 3x"
        src="~@/assets/images/gems/spooky-confetti-right/confetti.png"
      >
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.gems-promo-banner-fall_extra_gems {
  background: $gray-10;
}

.gems-promo-banner-spooky_extra_gems {
  background: $black;
}

.gems-promo-banner {
  .content {
    width: 100%;
    cursor: pointer;
  }
}
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import BaseBanner from './base';

export default {
  components: {
    BaseBanner,
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    currentEvent () {
      return find(this.currentEventList, event => Boolean(event.gemsPromo));
    },
    eventName () {
      return this.currentEvent && this.currentEvent.event;
    },
    showGemsPromoBanner () {
      const currEvt = this.currentEvent;
      if (!currEvt || !currEvt.gemsPromo) return false;
      return true;
    },
    bannerClass () {
      const bannerClass = 'gems-promo-banner';

      if (!this.showGemsPromoBanner) return bannerClass;
      return `${bannerClass} ${bannerClass}-${this.eventName}`;
    },
  },
  methods: {
    openGemsModal () {
      this.$root.$emit('bv::show::modal', 'buy-gems');
    },
  },
};
</script>
