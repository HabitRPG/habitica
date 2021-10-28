<template>
  <b-modal
    id="login-incentives"
    :title="data.message"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="row">
        <h3
          v-if="data.rewardText"
          class="col-12 text-center"
        >
          {{ $t('unlockedReward', {reward: data.rewardText}) }}
        </h3>
      </div>
      <div class="row reward-row">
        <div class="col-12">
          <avatar
            class="avatar"
            :member="user"
            :avatar-only="true"
            :hide-class-badge="true"
            :with-background="true"
          />
        </div>
        <div
          v-if="nextReward"
          class="text-center col-12"
        >
          <div
            v-if="!data.rewardText"
            class="reward-wrap"
          >
            <div
              v-if="nextReward.rewardKey.length === 1"
              :class="nextReward.rewardKey[0]"
            ></div>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="reward in nextReward.rewardKey"
              v-if="nextReward.rewardKey.length > 1"
              :key="reward"
              class="reward"
              :class="reward"
            ></div>
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          </div>
          <div
            v-if="data.rewardText"
            class="reward-wrap"
          >
            <div
              v-if="data.rewardKey.length === 1"
              :class="data.rewardKey[0]"
            ></div>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="reward in data.rewardKey"
              v-if="data.rewardKey.length > 1"
              :key="reward"
              class="reward"
              :class="reward"
            ></div>
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          </div>
        </div>
      </div>
      <div class="row">
        <div
          v-if="data.rewardText"
          class="col-12 text-center"
        >
          <p>{{ $t('earnedRewardForDevotion', {reward: data.rewardText}) }}</p>
        </div>
        <div class="col-12 text-center">
          <p>{{ $t('incentivesDescription') }}</p>
        </div>
        <div
          v-if="data && data.nextRewardAt"
          class="col-12 text-center"
        >
          <h3>
            {{ $t('nextRewardUnlocksIn', {
              numberOfCheckinsLeft: data.nextRewardAt - user.loginIncentives}) }}
          </h3>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('awesome') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .avatar {
    width: 140px;
  }

  .reward-wrap {
    width: max-content;
  }

  .avatar, .reward-wrap {
    margin: 0 auto;
  }

  .reward-row {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .reward {
    float: left;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import Avatar from '../avatar';
import content from '@/../../common/script/content/index';

export default {
  components: {
    Avatar,
  },
  props: ['data'],
  data () {
    return {
      loginIncentives: content.loginIncentives,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    nextReward () {
      if (!this.loginIncentives[this.user.loginIncentives]) return null;
      const nextRewardKey = this.loginIncentives[this.user.loginIncentives].nextRewardAt;
      const nextReward = this.loginIncentives[nextRewardKey];
      return nextReward;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'login-incentives');
    },
  },
};
</script>
