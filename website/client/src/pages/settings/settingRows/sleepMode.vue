<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("pauseDailies") }}
      </td>
      <td class="settings-value">
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t('learnMore') }}
        </a>
      </td>
    </tr>
    <tr
      v-if="mixinData.inlineSettingMixin.modalVisible"
      class="expanded"
    >
      <td colspan="3">
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("pauseDailies") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
          v-html="$t('sleepDescription')"
        >
        </div>

        <ul>
          <li v-once>
            {{ $t('sleepBullet1') }}
          </li>
          <li v-once>
            {{ $t('sleepBullet2') }}
          </li>
          <li v-once>
            {{ $t('sleepBullet3') }}
          </li>
        </ul>

        <div class="input-area">
          <save-cancel-buttons
            :primary-button-label="user.preferences.sleep ? 'unpauseDailies' : 'pauseDailies'"
            @saveClicked="toggleSleep(); requestCloseModal();"
            @cancelClicked="requestCloseModal();"
          />
        </div>
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.feedback {
  color: $gray-50;
}
</style>

<script>
import { mapState } from '@/libs/store';

import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SaveCancelButtons from '../components/saveCancelButtons.vue';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {};
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    toggleSleep () {
      this.$store.dispatch('user:sleep');
    },
  },
};
</script>
