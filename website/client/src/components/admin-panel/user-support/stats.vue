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
        <div class="form-group row">
          <label class="col-sm-3 col-form-label red-label">Health</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.hp"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label yellow-label">Experience</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.exp"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label blue-label">Mana</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.mp"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Level</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.lvl"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Gold</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.gp"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <h3>Stat Points</h3>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Unallocated</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.points"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label red-label">Strength</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.str"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label blue-label">Intelligence</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.int"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label purple-label">Perception</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.per"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label yellow-label">Constitution</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.con"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row" v-if="statPointsIncorrect">
          <label class="col-sm-3 col-form-label"></label>
          <div class="col-sm-9 red-label">Error: Sum of stat points should equal the users level
          </div>
        </div>
        <h3>Buffs</h3>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label red-label">Strength</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.buffs.str"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label blue-label">Intelligence</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.buffs.int"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label purple-label">Perception</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.buffs.per"
              class="form-control"
              type="number"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label yellow-label">Constitution</label>
          <div class="col-sm-9">
            <input
              v-model="hero.stats.buffs.con"
              class="form-control"
              type="number"
            >
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

  .red-label {
    color: $red_100;
  }
  .blue-label {
    color: $blue_100;
  }
  .purple-label {
    color: $purple_300;
  }
  .yellow-label {
    color: $yellow_50;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

import { mapState } from '@/libs/store';
import { userStateMixin } from '../../../mixins/userState';

function resetData (self) {
  self.expand = false;
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [
    userStateMixin,
    saveHero,
  ],
  computed: {
    ...mapState({ user: 'user.data' }),
    statPointsIncorrect () {
      console.log(this.hero.stats.points, this.hero.stats.str,
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
      this.saveHero({hero: { stats: this.hero.stats }, msg: 'Stats'})
    },
  }
};
</script>
