<template>
  <tr>
    <td class="settings-label">
      <div class="d-flex align-items-center">
        {{ $t("developerMode") }}
        <information-icon
          tooltip-id="developerMode"
          :tooltip="$t('developerModeTooltip')"
        />
      </div>
    </td>
    <td class="settings-value">
    </td>
    <td class="settings-button">
      <toggle-switch
        v-model="user.preferences.developerMode"
        @change="setUserPreference('developerMode')"
      />
    </td>
  </tr>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

::v-deep {
  .toggle-switch-outer {
    display: inline-block;
  }
}
</style>

<script>
import { mapState } from '@/libs/store';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';
import { GenericUserPreferencesMixin } from '@/pages/settings/components/genericUserPreferencesMixin';
import informationIcon from '@/assets/svg/information.svg';
import InformationIcon from '@/components/ui/informationIcon.vue';

export default {
  components: { InformationIcon, ToggleSwitch },
  mixins: [GenericUserPreferencesMixin],
  data () {
    return {
      icons: Object.freeze({
        information: informationIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
};
</script>
