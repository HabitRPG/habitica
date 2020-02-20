<template>
  <b-modal
    id="challenge-member-modal"
    title="User Progress"
    size="lg"
  >
    <div
      v-if="isLeader || isAdmin"
      class="row award-row"
    >
      <div class="col-12 text-center">
        <button
          v-once
          class="btn btn-primary"
          @click="closeChallenge()"
        >
          {{ $t('awardWinners') }}
        </button>
      </div>
    </div>
    <div class="row">
      <task-column
        v-for="column in columns"
        :key="column"
        class="col-6"
        :type="column"
        :task-list-override="tasksByType[column]"
      />
    </div>
  </b-modal>
</template>

<style scoped>
  .award-row {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>

<script>
import axios from 'axios';
import Column from '../tasks/column';

export default {
  components: {
    TaskColumn: Column,
  },
  props: ['challengeId'],
  data () {
    return {
      columns: ['habit', 'daily', 'todo', 'reward'],
      tasksByType: {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      },
      memberId: '',
      isLeader: false,
      isAdmin: false,
    };
  },
  watch: {
    async memberId (id) {
      if (!id) return;
      this.tasksByType = {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      };

      const response = await axios.get(`/api/v4/challenges/${this.challengeId}/members/${this.memberId}`);
      const { tasks } = response.data.data;
      tasks.forEach(task => {
        this.tasksByType[task.type].push(task);
      });
    },
  },
  mounted () {
    this.$root.$on('habitica:challenge:member-progress', data => {
      if (!data.progressMemberId) return;
      this.memberId = data.progressMemberId;
      this.isLeader = data.isLeader;
      this.isAdmin = data.isAdmin;
      this.$root.$emit('bv::show::modal', 'challenge-member-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:challenge:member-progress');
  },
  methods: {
    async closeChallenge () {
      this.challenge = await this.$store.dispatch('challenges:selectChallengeWinner', {
        challengeId: this.challengeId,
        winnerId: this.memberId,
      });
      this.$router.push('/challenges/myChallenges');
    },
  },
};
</script>
