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
        class="d-xl-block"
        :srcset="assets('confetti-left')?.srcSet"
        :src="assets('confetti-left')?.src"
      >
      <div>
        <img
          :srcset="assets('text')?.srcSet"
          :src="assets('text')?.src"
        >
      </div>
      <img
        class="d-xl-block"
        :srcset="assets('confetti-right')?.srcSet"
        :src="assets('confetti-right')?.src"
      >
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

$promos: ('spring', 'summer', 'fall', 'winter', 'flash');

@each $event in $promos {
  .gems-promo-banner-#{$event}_extra_gems {
    background: $gray-10;
  }
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

::v-deep .modal-close .svg-close {
  color: $white;
  opacity: 50%;
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
    assets (pieceName = '') {
      const { currentEvent } = this;
      if (!currentEvent) return null;
      let gemsPromoSeason = currentEvent.gemsPromo ? currentEvent.event.split('_')[0] // eslint-disable-line prefer-destructuring
        : '';
      if (gemsPromoSeason !== 'spooky' && pieceName.indexOf('confetti') !== -1) {
        gemsPromoSeason = 'seasonal';
      }
      return {
        src: `/static/gems/${pieceName}/${gemsPromoSeason}-${pieceName}.png`,
        srcSet: `/static/gems/${pieceName}/${gemsPromoSeason}-${pieceName}.png,
          /static/gems/${pieceName}/${gemsPromoSeason}-${pieceName}@2x.png 2x,
          /static/gems/${pieceName}/${gemsPromoSeason}-${pieceName}@3x.png 3x`,
      };
    },
  },
};
</script>
