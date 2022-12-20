<template>
  <fragment>
    <tr
      v-if="!modalVisible"
    >
      <td class="settings-label">
        {{ $t("changeClassSetting") }}
      </td>
      <td class="settings-value">
        TODO current class
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
          {{ $t("changeClassSetting") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span>{{ $t("changeClassDisclaimer") }}</span>
        </div>
        <div class="content-centered">
          <div class="class-selection">
            <div
              v-for="classType in classList"
              :key="classType"
              class="class-card"
              :class="{[classType]: true}"
            >
              <span
                class="svg-icon icon-48 mb-1"
                v-html="classIcons[classType]"
              ></span>

              <span class="label">
                {{ $t(classType) }}
              </span>
            </div>
          </div>

          <gem-price
            gem-price="3"
            icon-size="24"
            class="gem-price-spacing"
          />

          <save-cancel-buttons
            primary-button-label="changeClassSetting"
            :disable-save="previousValue === currentAudioTheme"
            class="mb-2"
            @saveClicked="changeAudioThemeAndClose()"
            @cancelClicked="closeModal()"
          />

          <your-balance />
        </div>
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

.content-centered {
  display: flex;
  flex-direction: column;
}

.gem-price-spacing {
  margin-bottom: 1.125rem;
  justify-content: center;
}

.class-selection {
  display: flex;
  gap: 22px;
  justify-content: center;

  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.class-card {
  height: 96px;
  width: 96px;
  min-width: 96px;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);

  background-color: $white;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.healer {
  color: $healer-color;
}

.rogue {
  color: $rogue-color;
}

.warrior {
  color: $warrior-color;
}

.wizard {
  color: $wizard-color;
}

.label {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.71;
  text-align: center;
}

</style>

<script>
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';
import sounds from '@/libs/sounds';
import YourBalance from '@/pages/settings/components/yourBalance.vue';
import GemPrice from '@/components/shops/gemPrice.vue';
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';

export default {
  components: {
    GemPrice,
    YourBalance,
    SaveCancelButtons,
  },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  data () {
    return {
      soundIndex: 0,
      previousValue: '',
      // using the user.preferences didn't update the select-list values from off state
      themeSelected: '',
      classIcons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
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
    classList () {
      return this.content.classes;
    },
  },
  mounted () {
    this.resetControls();
    this.previousValue = this.currentAudioTheme;
    this.themeSelected = this.currentAudioTheme;
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
      this.selectedFormat = this.previousValue;
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
    },
  },
};
</script>
