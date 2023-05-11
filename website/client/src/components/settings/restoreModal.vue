<template>
  <b-modal
    id="restore"
    :title="$t('fixValues')"
    :hide-footer="true"
    size="lg"
  >
    <p>{{ $t('fixValuesText1') }}</p>
    <p>{{ $t('fixValuesText2') }}</p>
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
    <div class="modal-footer">
      <button
        class="btn btn-danger"
        @click="close()"
      >
        {{ $t('discardChanges') }}
      </button>
      <button
        class="btn btn-primary"
        @click="restore()"
      >
        {{ $t('saveAndClose') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
import clone from 'lodash/clone';
import { MAX_LEVEL_HARD_CAP } from '@/../../common/script/constants';
import { mapState } from '@/libs/store';

export default {
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
        if (this.restoreValues.stats[stat] === ''
          || this.restoreValues.stats[stat] < 0
        ) {
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
