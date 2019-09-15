<template lang="pug">
  b-modal#challenge-member-modal(title="User Progress", size='lg')
    .row.award-row(v-if='isLeader || isAdmin')
      .col-12.text-center
        button.btn.btn-primary(v-once, @click='closeChallenge()') {{ $t('awardWinners') }}
    .row
      task-column.col-6(
        v-for="column in columns",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]')
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
  props: ['challengeId'],
  components: {
    TaskColumn: Column,
  },
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
  mounted () {
    this.$root.$on('habitica:challenge:member-progress', (data) => {
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
  watch: {
    async memberId (id) {
      if (!id) return;
      this.tasksByType = {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      };

      let response = await axios.get(`/api/v4/challenges/${this.challengeId}/members/${this.memberId}`);
      let tasks = response.data.data.tasks;
      tasks.forEach((task) => {
        this.tasksByType[task.type].push(task);
      });
    },
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
