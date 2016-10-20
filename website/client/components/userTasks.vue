<template lang="pug">
.row
  .sixteen.wide.column
      p Welcome back {{profileName}}!
      p You have {{tasksCount}} tasks!
  .four.wide.column(v-for="taskType in tasksTypes")
    h3 {{taskType}}s ()
    ul
      li(v-for="task in tasks", v-if="task.type === taskType", :key="task.id")
        span {{task.text}}
</template>

<script>
import { mapState, mapGetters } from '../store';

export default {
  data () {
    return {
      tasksTypes: ['habit', 'daily', 'todo', 'reward'],
    };
  },
  computed: {
    ...mapState(['tasks']),
    ...mapState({
      tasksCount: (state) => state.tasks.length,
    }),
    ...mapGetters(['profileName']),
  },
};
</script>