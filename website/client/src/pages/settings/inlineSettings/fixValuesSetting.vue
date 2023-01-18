<template>
  <fragment>
    <tr
      v-if="!modalVisible"
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
      v-if="modalVisible"
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
        "mana": "Mana",
        "hp": "HP",
        "mp": "MP",
        "xp": "XP",
        "health": "Health",
        <div class="fix-value-group">
          <span class="fix-label">
            {{ $t('health') }}
          </span>
          <div class="input-group">
            <div class="input-group-prepend positive-addon input-group-icon">
              <div
                v-once
                class="svg-icon"
                v-html="icons.health"
              ></div>
            </div>
            <input
              class="form-control"
              type="number"
              min="0"
              required="required"
            >
          </div>
        </div>


        <div class="form-horizontal">
          <h3>{{ $t('stats') }}</h3>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('health') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.stats.hp"
                class="form-control"
                type="number"
                step="any"
                data-for="stats.hp"
              >
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('experience') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.stats.exp"
                class="form-control"
                type="number"
                step="any"
                data-for="stats.exp"
              >
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('gold') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.stats.gp"
                class="form-control"
                type="number"
                step="any"
                data-for="stats.gp"
              >
            </div>
            <!--input.form-control(type='number',
         step="any", data-for='stats.gp', v-model='restoreValues.stats.gp',disabled)-->
          </div>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('mana') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.stats.mp"
                class="form-control"
                type="number"
                step="any"
                data-for="stats.mp"
              >
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('level') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.stats.lvl"
                class="form-control"
                type="number"
                data-for="stats.lvl"
              >
            </div>
          </div>
          <h3>{{ $t('achievements') }}</h3>
          <div class="form-group row">
            <div class="col-sm-3">
              <label class="control-label">{{ $t('fix21Streaks') }}</label>
            </div>
            <div class="col-sm-9">
              <input
                v-model="restoreValues.achievements.streak"
                class="form-control"
                type="number"
                data-for="achievements.streak"
              >
            </div>
          </div>
        </div>
        Health
        Exp
        Mana
        Gold
        Level
        21-Day-Streak
        TODO

        <save-cancel-buttons
          :disable-save="inputsInvalid || true"
          @saveClicked="changePassword( passwordUpdates)"
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

</style>

<script>
import clone from 'lodash/clone';
import SaveCancelButtons from '../components/saveCancelButtons.vue';
import { InlineSettingMixin } from '../components/inlineSettingMixin';
import healthIcon from '@/assets/svg/health.svg';
import experienceIcon from '@/assets/svg/experience.svg';
import manaIcon from '@/assets/svg/mana.svg';
import svgGold from '@/assets/svg/gold.svg';
import level from '@/assets/svg/level.svg';
import streakIcon from '@/assets/svg/streak.svg';
import { mapState } from '@/libs/store';
import { MAX_LEVEL_HARD_CAP } from '../../../../../common/script/constants';

export default {
  components: { SaveCancelButtons },
  mixins: [InlineSettingMixin],
  data () {
    return {
      restoreValues: {
        stats: {
          hp: 0,
          mp: 0,
          gp: 0,
          exp: 0,
          lvl: 0,
        },
        achievements: {
          streak: 0,
        },
      },
      icons: Object.freeze({
        health: healthIcon,
        experience: experienceIcon,
        mana: manaIcon,
        gold: svgGold,
        level,
        streak: streakIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.restoreValues.stats = clone(this.user.stats);
    this.restoreValues.achievements.streak = clone(this.user.achievements.streak);
  },
  methods: {
    close () {
      this.validateInputs();
      this.$root.$emit('bv::hide::modal', 'restore');
    },
    restore () {
      if (!this.validateInputs()) {
        return;
      }

      if (this.restoreValues.stats.lvl > MAX_LEVEL_HARD_CAP) {
        this.restoreValues.stats.lvl = MAX_LEVEL_HARD_CAP;
      }

      const userChangedLevel = this.restoreValues.stats.lvl !== this.user.stats.lvl;
      const userDidNotChangeExp = this.restoreValues.stats.exp === this.user.stats.exp;
      if (userChangedLevel && userDidNotChangeExp) this.restoreValues.stats.exp = 0;

      this.user.stats = clone(this.restoreValues.stats);
      this.user.achievements.streak = clone(this.restoreValues.achievements.streak);

      const settings = {
        'stats.hp': Number(this.restoreValues.stats.hp),
        'stats.exp': Number(this.restoreValues.stats.exp),
        'stats.gp': Number(this.restoreValues.stats.gp),
        'stats.lvl': Number(this.restoreValues.stats.lvl),
        'stats.mp': Number(this.restoreValues.stats.mp),
        'achievements.streak': Number(this.restoreValues.achievements.streak),
      };

      this.$store.dispatch('user:set', settings);
      this.$root.$emit('bv::hide::modal', 'restore');
    },
    validateInputs () {
      const canRestore = ['hp', 'exp', 'gp', 'mp'];
      let valid = true;

      for (const stat of canRestore) {
        if (this.restoreValues.stats[stat] === '') {
          this.restoreValues.stats[stat] = this.user.stats[stat];
          valid = false;
        }
      }

      const inputLevel = Number(this.restoreValues.stats.lvl);
      if (this.restoreValues.stats.lvl === ''
        || !Number.isInteger(inputLevel)
        || inputLevel < 1) {
        this.restoreValues.stats.lvl = this.user.stats.lvl;
        valid = false;
      }

      const inputStreak = Number(this.restoreValues.achievements.streak);
      if (this.restoreValues.achievements.streak === ''
        || !Number.isInteger(inputStreak)
        || inputStreak < 0) {
        this.restoreValues.achievements.streak = this.user.achievements.streak;
        valid = false;
      }

      return valid;
    },
  },
};
</script>
