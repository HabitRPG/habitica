<template>
  <fragment>
    <tr
      v-if="!mixinData.inlineSettingMixin.modalVisible"
    >
      <td class="settings-label">
        {{ $t("fixValues") }}
      </td>
      <td class="settings-value">
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
      <td
        colspan="3"
        novalidate="novalidate"
      >
        <div
          v-once
          class="dialog-title"
        >
          {{ $t("fixValues") }}
        </div>
        <div
          v-once
          class="dialog-disclaimer"
        >
          <span v-html="$t('fixValuesText1')"></span>
          <br>
          <br>
          <span v-html="$t('fixValuesText2')"></span>
        </div>

        <div class="content-centered">
          <div class="input-rows row">
            <div
              v-for="input in inputList"
              :key="input.property"
              class="col-4"
            >
              <div class="fix-value-group mt-3">
                <span class="fix-label">
                  {{ $t(input.translationKey) }}
                </span>
                <div class="input-group">
                  <div class="input-group-prepend positive-addon input-group-icon">
                    <div
                      v-once
                      class="svg-icon icon-16"
                      :class="{[input.translationKey]: true}"
                      v-html="input.icon"
                    ></div>
                  </div>
                  <input
                    v-model="restoreValues[input.property]"
                    class="form-control"
                    type="number"
                    min="0"
                    required="required"
                    @keydown="markAsChanged(input, $event)"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <save-cancel-buttons
          :disable-save="!mixinData.inlineSettingMixin.sharedState.inlineSettingUnsavedValues"
          class="mt-4"
          @saveClicked="save()"
          @cancelClicked="requestCloseModal()"
        />
      </td>
    </tr>
  </fragment>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.input-group {
  position: relative;
  background: white;
}

.input-rows {
  width: calc(600px + 1.5rem);
}

.content-centered {
  display: flex;
  flex-direction: column;

  align-items: center;
}

.fix-label {
  font-weight: bold;
  line-height: 1.71;
  color: $gray-50;
}

.svg-icon.icon-16 {
  width: 16px !important;
  height: 16px !important;
  display: flex;
}

input[type="number"] {
  -moz-appearance: textfield !important;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.svg-icon.level {
  color: $gray-200;

  :global svg path {
    fill: currentColor;
  }
}

</style>

<script>
// import clone from 'lodash/clone';
import { MAX_LEVEL_HARD_CAP, MAX_FIELD_HARD_CAP } from '@/../../common/script/constants';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import healthIcon from '@/assets/svg/health.svg';
import experienceIcon from '@/assets/svg/experience.svg';
import manaIcon from '@/assets/svg/mana.svg';
import svgGold from '@/assets/svg/gold.svg';
import level from '@/assets/svg/level.svg';
import streakIcon from '@/assets/svg/streak.svg';
import { mapState } from '@/libs/store';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      restoreValues: {
        hp: 0,
        mp: 0,
        gp: 0,
        exp: 0,
        lvl: 0,
        streak: 0,
      },
      icons: Object.freeze({
        health: healthIcon,
        experience: experienceIcon,
        mana: manaIcon,
        gold: svgGold,
        level,
        streak: streakIcon,
      }),
      inputList: Object.freeze([
        {
          translationKey: 'health',
          icon: healthIcon,
          property: 'hp',
        },
        {
          translationKey: 'experience',
          icon: experienceIcon,
          property: 'exp',
        }, {
          translationKey: 'mana',
          icon: manaIcon,
          property: 'mp',
        }, {
          translationKey: 'gold',
          icon: svgGold,
          property: 'gp',
        },
        {
          translationKey: 'level',
          icon: level,
          property: 'lvl',
        },
        {
          translationKey: 'fix21Streaks',
          icon: streakIcon,
          property: 'streak',
        },
      ]),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.resetControls();
  },
  methods: {
    resetControls () {
      const {
        hp, mp, gp, exp, lvl,
      } = this.user.stats;

      this.restoreValues = {
        hp, mp, gp, exp, lvl, streak: this.user.achievements.streak,
      };
    },
    close () {
      this.validateInputs();
    },
    markAsChanged (inputType, keyupEvent) {
      this.restoreValues[inputType.property] = keyupEvent.target.value;
      this.modalValuesChanged();
    },
    save () {
      if (!this.validateInputs()) {
        return;
      }

      const userChangedLevel = this.restoreValues.lvl !== this.user.stats.lvl;
      const userDidNotChangeExp = this.restoreValues.exp === this.user.stats.exp;
      if (userChangedLevel && userDidNotChangeExp) {
        this.restoreValues.exp = 0;
      }

      const settings = {
        'stats.hp': Number(this.restoreValues.hp),
        'stats.exp': Number(this.restoreValues.exp),
        'stats.gp': Number(this.restoreValues.gp),
        'stats.lvl': Number(this.restoreValues.lvl),
        'stats.mp': Number(this.restoreValues.mp),
        'achievements.streak': Number(this.restoreValues.streak),
      };

      this.$store.dispatch('user:set', settings);

      this.wasChanged = false;
      this.closeModal();
    },
    validateInputs () {
      const canRestore = ['hp', 'exp', 'gp', 'mp'];
      let valid = true;

      for (const stat of canRestore) {
        if (this.restoreValues[stat] === ''
          || this.restoreValues[stat] < 0
        ) {
          this.restoreValues[stat] = this.user.stats[stat];
          valid = false;
        } else if (this.restoreValues[stat] > MAX_FIELD_HARD_CAP) {
          this.restoreValues[stat] = MAX_FIELD_HARD_CAP;
          valid = false;
        }
      }

      const inputLevel = Number(this.restoreValues.lvl);
      if (this.restoreValues.lvl === ''
          || !Number.isInteger(inputLevel)
          || inputLevel < 1) {
        this.restoreValues.lvl = this.user.stats.lvl;
        valid = false;
      } else if (inputLevel > MAX_LEVEL_HARD_CAP) {
        this.restoreValues.lvl = MAX_LEVEL_HARD_CAP;
        valid = false;
      }

      const inputStreak = Number(this.restoreValues.streak);
      if (this.restoreValues.streak === ''
          || !Number.isInteger(inputStreak)
          || inputStreak < 0) {
        this.restoreValues.streak = this.user.achievements.streak;
        valid = false;
      }

      return valid;
    },
  },
};
</script>
