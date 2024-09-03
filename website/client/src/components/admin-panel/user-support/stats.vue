<template>
  <form @submit.prevent="submitClicked()">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{'open': expand}"
          @click="expand = !expand"
        >
          Stats
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
        <stats-row
          label="Health"
          color="red-label"
          :max="maxHealth"
          v-model="hero.stats.hp" />
        <stats-row
          label="Experience"
          color="yellow-label"
          min="0"
          :max="maxFieldHardCap"
          v-model="hero.stats.exp" />
        <stats-row
          label="Mana"
          color="blue-label"
          min="0"
          :max="maxFieldHardCap"
          v-model="hero.stats.mp" />
        <stats-row
          label="Level"
          step="1"
          min="0"
          :max="maxLevelHardCap"
          v-model="hero.stats.lvl" />
        <stats-row
          label="Gold"
          min="0"
          :max="maxFieldHardCap"
          v-model="hero.stats.gp" />
        <h3>Stat Points</h3>
        <stats-row
          label="Unallocated"
          min="0"
          step="1"
          :max="maxStatPoints"
          v-model="hero.stats.points" />
        <stats-row
          label="Strength"
          color="red-label"
          min="0"
          :max="maxStatPoints"
          step="1"
          v-model="hero.stats.str" />
        <stats-row
          label="Intelligence"
          color="blue-label"
          min="0"
          :max="maxStatPoints"
          step="1"
          v-model="hero.stats.int" />
        <stats-row
          label="Perception"
          color="purple-label"
          min="0"
          :max="maxStatPoints"
          step="1"
          v-model="hero.stats.per" />
        <stats-row
          label="Constitution"
          color="yellow-label"
          min="0"
          :max="maxStatPoints"
          step="1"
          v-model="hero.stats.con" />
        <div class="form-group row" v-if="statPointsIncorrect">
          <div class="offset-sm-3 col-sm-9 red-label">
            Error: Sum of stat points should equal the users level
          </div>
        </div>
        <h3>Buffs</h3>
        <stats-row
          label="Strength"
          color="red-label"
          min="0"
          step="1"
          v-model="hero.stats.buffs.str" />
        <stats-row
          label="Intelligence"
          color="blue-label"
          min="0"
          step="1"
          v-model="hero.stats.buffs.int" />
        <stats-row
          label="Perception"
          color="purple-label"
          min="0"
          step="1"
          v-model="hero.stats.buffs.per" />
        <stats-row
          label="Constitution"
          color="yellow-label"
          min="0"
          step="1"
          v-model="hero.stats.buffs.con" />
        <div class="form-group row">
          <div class="offset-sm-3 col-sm-9">
            <button
              type="button"
              class="btn btn-warning btn-sm"
              @click="resetBuffs">
              Reset Buffs
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .about-row {
    margin-left: 0px;
    margin-right: 0px;
  }
</style>

<script>
import {
  MAX_HEALTH,
  MAX_STAT_POINTS,
  MAX_LEVEL_HARD_CAP,
  MAX_FIELD_HARD_CAP,
} from '@/../../common/script/constants';
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

import { mapState } from '@/libs/store';
import { userStateMixin } from '../../../mixins/userState';

import StatsRow from './stats-row';

function resetData (self) {
  self.expand = false;
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
    StatsRow,
  },
  mixins: [
    userStateMixin,
    saveHero,
  ],
  computed: {
    ...mapState({ user: 'user.data' }),
    statPointsIncorrect () {
        this.hero.stats.int, this.hero.stats.per,
        this.hero.stats.con, this.hero.stats.lvl);
      return (parseInt(this.hero.stats.points, 10)
        + parseInt(this.hero.stats.str, 10)
        + parseInt(this.hero.stats.int, 10)
        + parseInt(this.hero.stats.per, 10)
        + parseInt(this.hero.stats.con, 10)
      ) !== this.hero.stats.lvl;
    },
  },
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
      maxHealth: MAX_HEALTH,
      maxStatPoints: MAX_STAT_POINTS,
      maxLevelHardCap: MAX_LEVEL_HARD_CAP,
      maxFieldHardCap: MAX_FIELD_HARD_CAP,
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
  methods: {
    submitClicked () {
      if (this.statPointsIncorrect) {
        return;
      }
      this.saveHero({
        hero: {
          _id: this.hero._id,
          stats: this.hero.stats,
        },
        msg: 'Stats',
      });
    },
    resetBuffs () {
      this.hero.stats.buffs = {
        str: 0,
        int: 0,
        per: 0,
        con: 0,
      };
    },
  },
};
</script>
