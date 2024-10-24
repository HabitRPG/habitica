<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("dateFormat") }}
      </td>
      <td class="settings-value">
        {{ currentActiveFormat }}
      </td>
      <td class="settings-button">
        <a
          class="edit-link"
          @click.prevent="openModal()"
        >
          {{ $t('edit') }}
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
          {{ $t("dateFormat") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span>{{ $t("dateFormatDisclaimer") }}</span>
        </div>
        <div class="input-area">
          <div class="settings-label">
            {{ $t("dateFormat") }}
          </div>
          <div class="form-group">
            <select-list
              :items="availableFormats"
              :value="selectedFormat"
              @select="changeFormat($event)"
            />
          </div>
        </div>

        <save-cancel-buttons
          :disable-save="selectedFormat === currentActiveFormat"
          @saveClicked="changeFormatAndClose()"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

input {
  margin-right: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

</style>

<script>
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SelectList from '@/components/ui/selectList';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';

export default {
  components: { SelectList, SaveCancelButtons },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  data () {
    return {
      selectedFormat: '',
      availableFormats: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'],
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    currentActiveFormat () {
      return this.user.preferences.dateFormat;
    },
  },
  mounted () {
    this.resetControls();
  },
  methods: {
    changeFormat (e) {
      this.selectedFormat = e;
      this.modalValuesChanged();
    },
    async changeFormatAndClose () {
      this.user.preferences.dateFormat = this.selectedFormat;
      await this.setUserPreference('dateFormat');
      this.closeModal();
    },
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.selectedFormat = this.currentActiveFormat;
    },
  },
};
</script>
