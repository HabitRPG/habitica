<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("language") }}
      </td>
      <td class="settings-value">
        {{ currentLanguageLabel }}
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
          {{ $t("language") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span>{{ $t("americanEnglishGovern") }} </span>
          <span v-html="$t('helpWithTranslation')"></span>
        </div>
        <div class="input-area">
          <div class="settings-label">
            {{ $t("siteLanguage") }}
          </div>
          <div class="form-group">
            <select-list
              :items="availableLanguages"
              :value="selectedLanguage"
              key-prop="code"
              active-key-prop="code"
              @select="changeLanguage($event)"
            >
              <template #item="{ item }">
                <span v-if="item === selectedLanguage">
                  {{ selectedLanguageLabel(selectedLanguage) }}
                </span>
                <span v-else>
                  {{ item.name }}
                </span>
              </template>
            </select-list>
          </div>
        </div>

        <save-cancel-buttons
          :disable-save="selectedLanguage === currentActiveLanguage"
          @saveClicked="changeLanguageAndClose()"
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
      selectedLanguage: '',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
    }),
    currentActiveLanguage () {
      return this.user.preferences.language;
    },
    currentLanguageLabel () {
      return this.selectedLanguageLabel(this.selectedLanguage);
    },
  },
  mounted () {
    this.resetControls();
  },
  methods: {
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.selectedLanguage = this.currentActiveLanguage;
    },
    changeLanguage (e) {
      const newLang = e.code;
      this.selectedLanguage = newLang;

      this.modalValuesChanged();
    },
    selectedLanguageLabel (languageKey) {
      if (!this.availableLanguages) {
        return '';
      }

      return this.availableLanguages.find(l => l.code === languageKey)?.name ?? '';
    },
    async changeLanguageAndClose () {
      this.user.preferences.language = this.selectedLanguage;
      await this.setUserPreference('language');
      setTimeout(() => window.location.reload(true));
    },
  },
};
</script>
