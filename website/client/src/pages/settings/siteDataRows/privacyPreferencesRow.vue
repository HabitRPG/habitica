<template>
  <tr>
    <td colspan="3">
      <h3
        v-once
        class="purple-200 mb-0"
      >
        {{ $t('yourPrivacyPreferences') }}
      </h3>
      <p
        v-once
        class="gray-50"
        v-html="$t('privacySettingsOverview') + ' ' + $t('learnMorePrivacy')"
      >
      </p>
      <div
        v-once
        class="d-flex justify-content-center"
      >
        <div class="w-66">
          <div class="mb-28p">
            <div
              class="d-flex justify-content-between align-items-center"
            >
              <div class="settings-label w-50"> {{ $t('strictlyNecessary') }}</div>
              <div class="settings-label mini green-10"> {{ $t('alwaysActive') }}</div>
            </div>
            <small class="gray-100">
              {{ $t('requiredToRun') }}
            </small>
          </div>
          <div
            class="d-flex justify-content-between align-items-center"
          >
            <div class="settings-label w-50"> {{ $t('performanceAnalytics') }}</div>
            <toggle-switch
              v-model="user.preferences.privacy.disableAnalytics"
              @change="setUserPreference('privacy', 'disableAnalytics')"
            />
          </div>
          <div class="mb-4">
            <small class="gray-100">
              {{ $t('usedForSupport') }}
            </small>
          </div>
          <div class="d-flex flex-column justify-content-center">
            <button class="btn btn-primary mx-auto mb-2">
              {{ $t('save') }}
            </button>
            <a class="mx-auto mb-4">{{ $t('cancel') }}</a>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  button {
    width: fit-content;
  }

  .mb-28p {
    margin-bottom: 28px;
  }

  .settings-label.mini {
    font-size: 12px;
    text-align: right;
  }

  small {
    line-height: 1.33;
  }

  .w-66 {
    width: 66.7%;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';
import { GenericUserPreferencesMixin } from '@/pages/settings/components/genericUserPreferencesMixin';

export default {
  mixins: [
    GenericUserPreferencesMixin,
  ],
  components: {
    ToggleSwitch,
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
};
</script>
