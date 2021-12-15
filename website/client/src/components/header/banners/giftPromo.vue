<template>
  <base-banner
    banner-id="gift-promo"
    class="gift-promo-banner"
    :show="showGiftPromoBanner"
    height="3rem"
  >
    <div
      slot="content"
      :aria-label="$t('subscription')"
      class="content d-flex justify-content-around align-items-center ml-auto mr-auto"
      @click="showSelectUser"
    >
      <div
        v-once
        class="svg-icon svg-gifts left-gift"
        v-html="icons.gifts"
      >
      </div>
      <div
        v-once
        class="announce-text"
        v-html="$t('g1g1Announcement')"
      >
      </div>
      <div
        v-once
        class="svg-icon svg-gifts right-gift"
        v-html="icons.gifts"
      >
      </div>
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .announce-text {
    color: $white;
  }

  .gift-promo-banner {
    width: 100%;
    min-height: 3rem;
    background-image: linear-gradient(90deg, $teal-50 0%, $purple-400 100%);
    cursor: pointer;
  }

  .left-gift {
    margin: auto 1rem auto auto;
  }

  .right-gift {
    margin: auto auto auto 1rem;
    filter: flipH;
    transform: scaleX(-1);
  }

  .svg-gifts {
    width: 4.6rem;
  }
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import BaseBanner from './base';

import gifts from '@/assets/svg/gifts.svg';

export default {
  components: {
    BaseBanner,
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    currentEvent () {
      return find(this.currentEventList, event => Boolean(event.promo));
    },
    eventName () {
      return this.currentEvent && this.currentEvent.event;
    },
    showGiftPromoBanner () {
      const currEvt = this.currentEvent;
      if (!currEvt) return false;
      return currEvt && currEvt.promo === 'g1g1';
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gifts,
      }),
    };
  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
  },
};
</script>
