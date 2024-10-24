<template>
  <base-banner
    banner-id="birthday-banner"
    class="birthday-banner"
    :show="showBirthdayBanner"
    height="3rem"
    :can-close="false"
  >
    <div
      slot="content"
      :aria-label="$t('celebrateBirthday')"
      class="content d-flex justify-content-around align-items-center ml-auto mr-auto"
      @click="showBirthdayModal"
    >
      <div
        v-once
        class="svg-icon svg-gifts left-gift"
        v-html="icons.giftsBirthday"
      >
      </div>
      <div
        v-once
        class="svg-icon svg-ten-birthday"
        v-html="icons.tenBirthday"
      >
      </div>
      <div
        v-once
        class="announce-text"
        v-html="$t('celebrateBirthday')"
      >
      </div>
      <div
        v-once
        class="svg-icon svg-gifts right-gift"
        v-html="icons.giftsBirthday"
      >
      </div>
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .announce-text {
    color: $purple-50;
  }

  .birthday-banner {
    width: 100%;
    min-height: 48px;
    padding: 8px;
    background-image: linear-gradient(90deg,
      rgba(255,190,93,0) 0%,
      rgba(255,190,93,1) 25%,
      rgba(255,190,93,1) 75%,
      rgba(255,190,93,0) 100%),
      url('~@/assets/images/glitter.png');
    cursor: pointer;
  }

  .left-gift {
    margin: auto;
  }

  .right-gift {
    margin: auto auto auto 8px;
    filter: flipH;
    transform: scaleX(-1);
  }

  .svg-gifts {
    width: 85px;
  }

  .svg-ten-birthday {
    width: 192.5px;
    margin-left: 8px;
    margin-right: 8.5px;
  }
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import BaseBanner from './base';

import giftsBirthday from '@/assets/svg/gifts-birthday.svg';
import tenBirthday from '@/assets/svg/10th-birthday-linear.svg';

export default {
  components: {
    BaseBanner,
  },
  data () {
    return {
      icons: Object.freeze({
        giftsBirthday,
        tenBirthday,
      }),
    };
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    showBirthdayBanner () {
      return Boolean(find(this.currentEventList, event => Boolean(event.event === 'birthday10')));
    },
  },
  methods: {
    showBirthdayModal () {
      this.$root.$emit('bv::show::modal', 'birthday-modal');
    },
  },
};

</script>
