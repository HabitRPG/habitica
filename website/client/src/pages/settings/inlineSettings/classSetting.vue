<template>
  <fragment>
    <tr
      v-if="!modalVisible"
    >
      <td class="settings-label">
        {{ $t("changeClassSetting") }}
      </td>
      <td class="settings-value">
        <div
          class="class-value"
          :class="{[selectedClass]: true}"
        >
          <span
            class="svg-icon icon-16 mr-2"
            v-html="classIcons[selectedClass]"
          ></span>

          <span class="label">
            {{ $t(selectedClass) }}
          </span>
        </div>
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
              :class="{[classType]: true, selected: classType === selectedClass}"
              @click="selectedClass = classType"
            >
              <span
                class="svg-icon icon-48 mb-1"
                v-html="classIcons[classType]"
              ></span>

              <span class="label">
                {{ $t(classType) }}
              </span>

              <div
                v-if="classType === selectedClass"
                class="selected-badge"
              >
                <span
                  class="svg-icon"
                  v-html="icons.check"
                ></span>
              </div>
            </div>
          </div>

          <gem-price
            gem-price="3"
            icon-size="24"
            class="gem-price-spacing"
          />

          <save-cancel-buttons
            primary-button-label="changeClassSetting"
            class="mb-2"
            :disable-save="previousValue === selectedClass"
            @saveClicked="changeClassAndClose()"
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
  position: relative;

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

  cursor: pointer;

  &:hover {
    box-shadow: 0 3px 6px 0 rgba($black, 0.16), 0 3px 6px 0 rgba($black, 0.24);
    border: solid 1px $purple-400;
  }

  &.selected {
    border: solid 1px $green-100;
  }
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

.selected-badge {
  position: absolute;
  bottom: -1rem;

  width: 24px;
  height: 24px;

  padding: 4px;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  background-color: $green-50;
  border-radius: 1rem;

  color: $white;
}

.class-value {
  display: flex;
  align-items: center;

  .label {
    font-weight: bold;
    line-height: 1.71;
  }
}

</style>

<script>
import { mapState } from '@/libs/store';

import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import { GenericUserPreferencesMixin } from '../components/genericUserPreferencesMixin';
import YourBalance from '@/pages/settings/components/yourBalance.vue';
import GemPrice from '@/components/shops/gemPrice.vue';
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';
import checkIcon from '@/assets/svg/check.svg';

export default {
  components: {
    GemPrice,
    YourBalance,
    SaveCancelButtons,
  },
  mixins: [InlineSettingMixin, GenericUserPreferencesMixin],
  data () {
    return {
      previousValue: '',
      selectedClass: '',
      classIcons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
      icons: Object.freeze({
        check: checkIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
      content: 'content',
    }),
    classList () {
      return this.content.classes;
    },
  },
  mounted () {
    this.previousValue = this.user.stats.class;
    this.resetControls();
  },
  methods: {
    async changeClassAndClose () {
      if (this.user.flags.classSelected && !window.confirm(this.$t('changeClassConfirmCost'))) {
        return;
      }

      this.$store.dispatch('user:changeClass', { query: { class: this.selectedClass } });

      this.closeModal();
    },
    /**
     * is a callback from the {InlineSettingMixin}
     * do not remove
     */
    resetControls () {
      this.selectedClass = this.previousValue;
    },
  },
};
</script>
