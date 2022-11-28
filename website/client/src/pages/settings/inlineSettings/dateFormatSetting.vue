<template>
  <fragment>
    <tr
      v-if="!modalVisible"
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
      v-if="modalVisible"
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
          @cancelClicked="closeModal()"
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

import SaveCancelButtons from '../components/_saveCancelButtons';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SelectList from '@/components/ui/selectList';
import { GenericSettingMixin } from '../components/genericSettingMixin';

export default {
  components: { SelectList, SaveCancelButtons },
  mixins: [InlineSettingMixin, GenericSettingMixin],
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
    this.selectedFormat = this.currentActiveFormat;
  },
  methods: {
    changeFormat (e) {
      this.selectedFormat = e;
    },
    async changeFormatAndClose () {
      this.user.preferences.dateFormat = this.selectedFormat;
      await this.set('dateFormat');
      this.closeModal();
    },
  },
};
</script>
