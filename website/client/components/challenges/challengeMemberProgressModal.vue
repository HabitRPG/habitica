<template lang="pug">
  b-modal#challenge-member-modal(title="User Progress", size='lg')
    .row
      task-column.col-6(
        v-for="column in columns",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]')
</template>

<script>
import axios from 'axios';
import Column from '../tasks/column';

export default {
  props: ['challengeId', 'memberId'],
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

      let response = await axios.get(`/api/v3/challenges/${this.challengeId}/members/${this.memberId}`);
      let tasks = response.data.data.tasks;
      tasks.forEach((task) => {
        this.tasksByType[task.type].push(task);
      });
    },
  },
};
</script>
