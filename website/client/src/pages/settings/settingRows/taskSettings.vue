<template>
  <fragment>
    <tr>
      <td class="settings-label">
        <span
          v-b-popover.hover.right="$t('startAdvCollapsedPop')"
          class="hint"
        >{{ $t('startAdvCollapsed') }}</span>
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <toggle-switch
          v-model="user.preferences.advancedCollapsed"
          @change="setUserPreference('advancedCollapsed')"
        />
      </td>
    </tr>
    <tr>
      <td class="settings-label">
        <span
          v-b-popover.hover.right="$t('dailyDueDefaultViewPop')"
          class="hint"
        >{{ $t('dailyDueDefaultView') }}</span>
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <toggle-switch
          v-model="user.preferences.dailyDueDefaultView"
          @change="setUserPreference('dailyDueDefaultView')"
        />
      </td>
    </tr>
  </fragment>
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

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';


export default {
  components: { ToggleSwitch },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {},
};
</script>
