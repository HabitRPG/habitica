<template>
  <b-modal
    id="privacy-preferences"
    size="md"
    :hide-footer="true"
    :hide-header="true"
  >
    <close-x
      @close="close()"
    />
    <h1 class="purple-200 mb-3">
      {{ $t('yourPrivacyPreferences') }}
    </h1>
    <p>
      {{ $t('privacySettingsOverview') }}
    </p>
    <div class="mb-4">
      <div
        class="d-flex justify-content-between align-items-center mb-1"
      >
        <label class="mb-0">
          {{ $t('performanceAnalytics') }}
        </label>
        <toggle-switch
          v-model="privacyConsent"
        />
      </div>
      <small>
        {{ $t('usedForSupport') }}
      </small>
    </div>
    <div class="mt-1 mb-4">
      <div
        class="d-flex justify-content-between align-items-center mb-1"
      >
        <label class="mb-0">
          {{ $t('strictlyNecessary') }}
        </label>
        <toggle-switch
          :checked="true"
          :disabled="true"
        />
      </div>
      <small>
        {{ $t('requiredToRun') }}
      </small>
    </div>
    <div class="d-flex flex-column text-center">
      <button
        class="btn btn-primary mb-2"
        @click="consent(true)"
      >
        {{ $t('acceptAllCookies') }}
      </button>
      <button
        class="btn btn-primary mb-2"
        @click="consent(false)"
      >
        {{ $t('denyNonEssentialCookies') }}
      </button>
      <button
        class="btn btn-secondary mb-3"
        @click="consent(privacyConsent)"
      >
        {{ $t('savePreferences') }}
      </button>
      <a
        href="/static/privacy"
        target="_blank"
      >
        {{ $t('habiticaPrivacyPolicy') }}
      </a>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #privacy-preferences {
    .modal-body {
      padding: 24px;
    }
    .modal-content {
      width: 448px;
    }
  }
</style>

<style lang="scss" scoped>
  label {
    font-weight: 700;
  }
  label, p {
    line-height: 1.714;
  }
</style>

<script>
import closeX from '@/components/ui/closeX';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';

export default {
  components: {
    closeX,
    ToggleSwitch,
  },
  data () {
    return {
      privacyConsent: true,
    };
  },
  methods: {
    consent (decision) {
      localStorage.setItem('analyticsConsent', decision);
      this.$root.$emit('privacy-complete');
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'privacy-preferences');
    },
  },
};
</script>
