<template>
  <div
    :key="lastTimeJump"
    class="time-travel"
  >
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(-1)"
    >-1 Day</a>
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(-7)"
    >-7 Days</a>
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(-30)"
    >-30 Days</a>
    <div class="my-2">
      Time Traveling! It is {{ new Date().toLocaleDateString() }}
      <a
        class="btn btn-small"
        @click="resetTime()"
      >
        Reset
      </a>
    </div>
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(1)"
    >+1 Day</a>
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(7)"
    >+7 Days</a>
    <a
      class="btn btn-secondary mr-1"
      @click="jumpTime(30)"
    >+30 Days</a>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.time-travel {
  grid-area: time-travel;

  a:hover {
    text-decoration: none !important;
  }
}

.btn-small {
  background-color: $maroon-100;
  border: 2px solid transparent;
  color: $white !important;
  line-height: 18px;
  &:hover {
    background-color: $maroon-100;
    text-decoration: none !important;
    border: 2px solid $maroon-100;
  }
}

.btn-secondary {
  padding: 2px 12px;
}
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';
import { mapState } from '@/libs/store';
import { worldStateMixin } from '@/mixins/worldState';

export default {
  mixins: [worldStateMixin],
  data () {
    return {
      lastTimeJump: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    async jumpTime (amount) {
      const response = await axios.post('/api/v4/debug/jump-time', { offsetDays: amount });
      setTimeout(() => {
        if (amount > 0) {
          Vue.config.clock.jump(amount * 24 * 60 * 60 * 1000);
        } else {
          Vue.config.clock.setSystemTime(moment().add(amount, 'days').toDate());
        }
        this.lastTimeJump = response.data.data.time;
        this.triggerGetWorldState(true);
      }, 1000);
    },
    async resetTime () {
      const sinon = await import('sinon');
      const response = await axios.post('/api/v4/debug/jump-time', { reset: true });
      const time = new Date(response.data.data.time);
      setTimeout(() => {
        Vue.config.clock.restore();
        Vue.config.clock = sinon.useFakeTimers({
          now: time,
          shouldAdvanceTime: true,
        });
        this.lastTimeJump = response.data.data.time;
        this.triggerGetWorldState(true);
      }, 1000);
    },
  },
};
</script>
