<template>
  <b-modal
    id="low-health"
    :title="$t('losingHealthWarning')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12 text-center">
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
          <span class="meter-text value">{{ healthLeft }}</span>
        </div>
      </div>
      <div class="col-12">
        <avatar
          :member="user"
          :avatar-only="true"
          :with-background="true"
        />
      </div>
      <div class="col-12">
        <p>{{ $t('losingHealthWarning2') }}</p>
        <h4>{{ $t('toRegainHealth') }}</h4>
        <ul>
          <li class="spaced">
            {{ $t('lowHealthTips1') }}
          </li>
          <li class="spaced">
            {{ $t('lowHealthTips2') }}
          </li>
        </ul>
        <h4>{{ $t('losingHealthQuickly') }}</h4>
        <ul>
          <li class="spaced">
            {{ $t('lowHealthTips3') }}
          </li>
          <li class="spaced">
            {{ $t('lowHealthTips4') }}
          </li>
        </ul>
        <h4>{{ $t('goodLuck') }}</h4>
      </div>
    </div>
    <div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-primary"
          @click="acknowledgeHealthWarning()"
        >
          {{ $t('ok') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .hero-stats {
    position: absolute;
    margin-left: 9em;
    width: 50%;
  }

  .character-sprites {
    display: inline-flex;
    margin: 3em auto;
  }

  .herobox {
    padding-top: 0em;
    margin-left: 16em;
  }

  .modal-footer {
    margin-top: 0em;
  }

  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import percent from '@/../../common/script/libs/percent';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';

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
    healthLeft () {
      return `${Math.ceil(this.user.stats.hp)} / ${this.maxHealth}`;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'low-health');
    },
    acknowledgeHealthWarning () {
      this.$store.dispatch('user:set', {
        'flags.warnedLowHealth': true,
      });
      this.close();
    },
  },
};
</script>
