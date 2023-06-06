<template>
  <base-banner
    banner-id="damage-paused"
    banner-class="resting-banner"
    :show="showRestingBanner"
    height="40px"
  >
    <div
      slot="content"
      class="content"
    >
      <span
        v-once
        class="label d-inline d-sm-none"
      >{{ $t('innCheckOutBannerShort') }}</span>
      <span
        v-once
        class="label d-none d-sm-inline"
      >{{ $t('innCheckOutBanner') }}</span>
      <span class="separator">|</span>
      <span
        v-once
        class="resume"
        @click="resumeDamage()"
      >{{ $t('resumeDamage') }}</span>
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.resting-banner {
  background-color: $blue-10;

  .content {
    line-height: 1.71;
    text-align: center;
    color: $white;
    padding: 0.5rem;
    margin: auto;
  }

  @media only screen and (max-width: 992px) {
    .content {
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .separator {
    color: $blue-100;
    margin: 0 1rem;
  }

  .resume {
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;
  }
}
</style>

<script>
import { mapState } from '@/libs/store';
import BaseBanner from './base';

export default {
  components: {
    BaseBanner,
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    showRestingBanner () {
      return this.user && this.user.preferences.sleep;
    },
  },
  methods: {
    resumeDamage () {
      this.$store.dispatch('user:sleep');
    },
  },
};
</script>
