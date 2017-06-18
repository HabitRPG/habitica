<template lang="pug">
.row.user-tasks-page
  .col-12
    .row.tasks-navigation
      .col-4.offset-4
        input.form-control.input-search(type="text", :placeholder="$t('search')")
      .col-1.offset-3
        button.btn.btn-success(v-once) {{ $t('create') }}
    .row
      .col-3(v-for="taskType in tasksTypes")
        h3 {{taskType}}s
        ul.tasks-column
          task(v-for="task in tasks", v-if="task.type === taskType", :key="task.id", :task="task")
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.user-tasks-page {
  padding-top: 31px;
}

.tasks-navigation {
  margin-bottom: 40px;
}

.tasks-column {
  border-radius: 4px;
  background: $gray-600;
  padding: 8px;
}
</style>
<script>
import Task from './task';
import { mapState } from 'client/libs/store';

export default {
  components: {
    Task,
  },
  data () {
    return {
      tasksTypes: ['habit', 'daily', 'todo', 'reward'],
    };
  },
  computed: {
    ...mapState({tasks: 'tasks.data'}),
  },
};
</script>
