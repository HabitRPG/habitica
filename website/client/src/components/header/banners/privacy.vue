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
        @click="consent(true)"
      >
        {{ $t('acceptAllCookies') }}
      </button>
      <button
        class="btn btn-secondary mb-2"
        @click="consent(false)"
      >
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

  @media only screen and (max-width: 1300px) {
    .banner {
      flex-direction: column !important;

      button {
        width: 100%;
      }

      .navigation {
        width: 100%;
        margin-left: 0px !important;
      }

      p {
        margin-bottom: 16px !important;
      }
    }
  }
</style>

<script>
import { nextTick } from 'vue';
import { GenericUserPreferencesMixin } from '@/pages/settings/components/genericUserPreferencesMixin';
import { EVENTS } from '@/libs/events';
import { mapState } from '@/libs/store';

export default {
  mixins: [GenericUserPreferencesMixin],
  computed: {
    isStaticPage () {
      return this.$route.meta.requiresLogin === false;
    },
    ...mapState({
      user: 'user.data',
    }),
  },
  data () {
    return {
      hidden: false,
    };
  },
  mounted () {
    if (localStorage.getItem('analyticsConsent') !== null
      || this.user?.preferences?.analyticsConsent !== undefined
      || navigator.globalPrivacyControl
    ) {
      this.hidden = true;
    }
  },
  methods: {
    close () {
      this.hidden = true;
      nextTick(() => {
        this.$root.$emit(EVENTS.BANNER_HEIGHT_UPDATED);
      });
    },
    consent (decision) {
      if (this.user) {
        this.user.preferences.analyticsConsent = decision;
        this.setUserPreference('analyticsConsent');
      } else {
        localStorage.setItem('analyticsConsent', decision);
      }
      this.close();
    },
    showPrivacyModal () {
      this.$root.$emit('bv::show::modal', 'privacy-preferences');
    },
  },
};
</script>
