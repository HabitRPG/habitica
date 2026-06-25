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
      <div
        class="w-100 mr-4"
        :class="confettiClass('left')"
      ></div>
      <div>
        <img
          :srcset="textAssets?.srcSet"
          :src="textAssets?.src"
        >
      </div>
      <div
        class="w-100 ml-4"
        :class="confettiClass('right')"
      ></div>
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

$promos: ('spring', 'summer', 'fall', 'winter', 'flash');
$sides: ('left', 'right');
$types: ('seasonal', 'spooky');

@each $type in $types {
  @each $side in $sides {
    .confetti-#{$side}-#{$type} {
      height: 37px;
      background-image: url('/static/gems/confetti-#{$side}/#{$type}-confetti-#{$side}.png');
      background-image: image-set(
        url('/static/gems/confetti-#{$side}/#{$type}-confetti-#{$side}.png') 1x,
        url('/static/gems/confetti-#{$side}/#{$type}-confetti-#{$side}@2x.png') 2x,
        url('/static/gems/confetti-#{$side}/#{$type}-confetti-#{$side}@3x.png') 3x,
      );
      background-repeat: repeat-x;
    }
  }
}

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
    gemsPromoSeason () {
      const { currentEvent } = this;
      if (!currentEvent) return null;
      return currentEvent.gemsPromo ? currentEvent.event.split('_')[0] // eslint-disable-line prefer-destructuring
        : '';
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
    textAssets () {
      return {
        src: `/static/gems/text/${this.gemsPromoSeason}-text.png`,
        srcSet: `/static/gems/text/${this.gemsPromoSeason}-text.png,
          /static/gems/text/${this.gemsPromoSeason}-text@2x.png 2x,
          /static/gems/text/${this.gemsPromoSeason}-text@3x.png 3x`,
      };
    },
  },
  methods: {
    openGemsModal () {
      this.$root.$emit('bv::show::modal', 'buy-gems');
    },
    confettiClass (side = 'left') {
      if (this.gemsPromoSeason === 'spooky') {
        return `confetti-${side}-spooky`;
      }
      return `confetti-${side}-seasonal`;
    },
  },
};
</script>
