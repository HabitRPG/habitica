<template>
  <div
    class="banner d-flex align-items-center justify-content-between py-3 px-4"
    id="privacy-banner"
    v-if="!hidden"
  >
    <p
      class="mr-3 mb-0"
      v-html="$t('privacyOverview') + ' ' + $t('learnMorePrivacy')"
    >
    </p>
    <div
      class="navigation d-flex flex-column justify-content-around text-center ml-2"
      :class="{ static: isStaticPage }"
    >
      <button
        class="btn btn-primary mb-2"
        @click="close()"
      >
        {{ $t('acceptAllCookies') }}
      </button>
      <button class="btn btn-secondary mb-2">
        {{ $t('denyNonEssentialCookies') }}
      </button>
      <a
        v-if="isStaticPage"
        @click="showPrivacyModal"
      >
        {{ $t('managePrivacyPreferences') }}
      </a>
      <router-link
        v-else
        to="/user/settings/siteData"
      >
        {{ $t('managePrivacyPreferences') }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  button {
    width: 558px;
  }

  a, p {
    line-height: 1.714;
  }

  @media only screen and (max-width: 992px) {
    .banner {
      flex-direction: column !important;

      .navigation {
        margin-left: 0px !important;
      }

      button {
        width: calc(100vw - 48px);
      }

      .static button {
        width: calc(100vw - 96px);
      }

      p {
        margin-bottom: 16px !important;
      }
    }
  }
</style>

<script>
import { nextTick } from 'vue';
import {
  hideBanner, isBannerHidden,
} from '@/libs/banner.func';
import { EVENTS } from '@/libs/events';

const BANNER_ID = 'privacy-preferences';

export default {
  computed: {
    isStaticPage () {
      return this.$route.meta.requiresLogin === false;
    },
  },
  data () {
    return {
      hidden: false,
    };
  },
  mounted () {
    if (isBannerHidden(BANNER_ID)) {
      this.hidden = true;
    }
  },
  methods: {
    close () {
      hideBanner(BANNER_ID);
      this.hidden = true;
      nextTick(() => {
        this.$root.$emit(EVENTS.BANNER_HEIGHT_UPDATED);
      });
    },
    showPrivacyModal () {
      this.$root.$emit('bv::show::modal', 'privacy-preferences');
    },
  },
};
</script>
