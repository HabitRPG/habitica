<template>
  <fragment>
    <tr>
      <td class="settings-label">
        {{ $t("showHeader") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <toggle-switch
          v-model="user.preferences.showHeader"
          @change="setUserPreference('showHeader')"
        />
      </td>
    </tr>
    <tr>
      <td class="settings-label">
        {{ $t("stickyHeader") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <toggle-switch
          v-model="user.preferences.stickyHeader"
          @change="setUserPreference('stickyHeader')"
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
  methods: {

  },
};
</script>
