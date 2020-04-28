<template>
  <b-modal
    id="death"
    :title="$t('lostAllHealth')"
    size="md"
    :hide-footer="true"
    no-close-on-esc="no-close-on-esc"
    no-close-on-backdrop="no-close-on-backdrop"
  >
    <div class="row">
      <div class="col-12">
        <div class="hero-stats">
          <div
            class="meter-label"
            :tooltip="$t('health')"
          >
            <span class="glyphicon glyphicon-heart"></span>
          </div>
          <div
            class="meter health"
            :tooltip="Math.round(user.stats.hp * 100) / 100"
          >
            <div
              class="bar"
              :style="barStyle"
            ></div>
          </div>
          <!-- span.meter-text.value| {{Math.ceil(user.stats.hp)}} / {{maxHealth}}-->
          <avatar
            :member="user"
            :sleep="true"
            :avatar-only="true"
            :with-background="true"
          />
          <!-- @TODO: Sleep +generatedAvatar({sleep:true})-->
          <span class="knockout"></span>
        </div>
      </div>
      <div class="col-6 offset-3">
        <h4 class="dont-despair">
          {{ $t('dontDespair') }}
        </h4>
        <p class="death-penalty">
          {{ $t('deathPenaltyDetails') }}
        </p>
      </div>
    </div>
    <div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-danger"
          @click="revive()"
        >
          {{ $t('refillHealthTryAgain') }}
        </button>
        <h4
          class="text-center"
          v-html="$t('dyingOftenTips')"
        ></h4>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import axios from 'axios';
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import percent from '@/../../common/script/libs/percent';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';
import revive from '@/../../common/script/ops/revive';

export default {
  components: {
    Avatar,
  },
  data () {
    return {
      maxHealth,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    barStyle () {
      return {
        width: `${percent(this.user.stats.hp, maxHealth)}%`,
      };
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'death');
    },
    async revive () {
      await axios.post('/api/v4/user/revive');
      revive(this.user);
      this.close();
    },
  },
};
</script>
