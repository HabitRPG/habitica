<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td
        v-once
        class="settings-label"
      >
        {{ $t("audioTheme") }}
      </td>
      <td class="settings-value">
        {{ $t(`audioTheme_${currentAudioTheme}`) }}
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
          {{ $t("audioTheme") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span>{{ $t("audioThemeDisclaimer") }}</span>
        </div>
        <div class="input-area">
          <div class="label-columns">
            <div class="settings-label">
              {{ $t("enableAudio") }}
            </div>
            <div>
              <toggle-switch
                :checked="!isDisabled"
                @change="toggleAudioThemeOff($event)"
              />
            </div>
          </div>
          <div class="label-columns mb-2">
            <div class="settings-label">
              {{ $t("audioTheme") }}
            </div>
            <div v-if="!isDisabled">
              <a
                class="edit-link"
                @click.prevent="playAudio()"
              >
                {{ $t('playDemoAudio') }}
              </a>
            </div>
          </div>

          <div class="form-group">
            <select-list
              :disabled="isDisabled"
              :items="availableAudioThemes"
              :value="themeSelected"
              @select="changeAudioThemeTemporary($event)"
            >
              <template #item="{ item, button }">
                <span v-if="button">
                  {{ $t(`audioTheme_${themeSelected}`) }}
                </span>
                <span v-else>
                  {{ $t(`audioTheme_${item}`) }}
                </span>
              </template>
            </select-list>
          </div>
        </div>

        <save-cancel-buttons
          :disable-save="previousValue === currentAudioTheme"
          @saveClicked="changeAudioThemeAndClose()"
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

.label-columns {
  display: flex;

  &:first-of-type {
    margin-bottom: 1rem;
  }

  div:first-of-type {
    flex: 1
  }
}

</style>

<script>
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import SelectList from '@/components/ui/selectList';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';
import sounds from '@/libs/sounds';
import ToggleSwitch from '@/components/ui/toggleSwitch.vue';

export default {
  components: { ToggleSwitch, SelectList, SaveCancelButtons },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  data () {
    return {
      soundIndex: 0,
      previousValue: '',
      // using the user.preferences didn't update the select-list values from off state
      themeSelected: '',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
      content: 'content',
    }),
    availableAudioThemes () {
      return this.content.audioThemes;
    },
    currentAudioTheme () {
      return this.user.preferences.sound;
    },
    isDisabled () {
      return this.currentAudioTheme === 'off';
    },
  },
  mounted () {
    this.previousValue = this.currentAudioTheme;
    this.resetControls();
  },
  methods: {
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.changeAudioThemeTemporary(this.previousValue);
    },
    changeAudioThemeTemporary ($event) {
      this.user.preferences.sound = $event;
      this.themeSelected = $event;
      this.soundIndex = 0;
    },
    changeAudioThemeAndClose () {
      this.setUserPreference('sound');
      this.previousValue = this.user.preferences.sound;
      this.closeModal();
    },
    playAudio () {
      this.$root.$emit('playSound', sounds[this.soundIndex]);
      this.soundIndex = (this.soundIndex + 1) % sounds.length;
    },
    toggleAudioThemeOff (enabled) {
      if (enabled) {
        const [audioTheme] = this.availableAudioThemes;

        this.changeAudioThemeTemporary(audioTheme);
      } else {
        this.changeAudioThemeTemporary('off');
      }

      this.modalValuesChanged();
    },
  },
};
</script>
