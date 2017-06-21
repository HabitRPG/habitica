<template lang="pug">
.row.user-tasks-page
  .col-12
    .row.tasks-navigation
      .col-4.offset-4
        input.form-control.input-search(type="text", :placeholder="$t('search')")
      .col-1.offset-3
        button.btn.btn-success(v-once) {{ $t('create') }}
    .row
      .tasks-column.col-3(v-for="taskType in tasksTypes", :key="taskType.type")
        h2.tasks-column-title(v-once) {{ $t(taskType.string) }}
        .tasks-list
          task(v-for="task in tasks[`${taskType.type}s`]", :key="task.id", :task="task")
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.user-tasks-page {
  padding-top: 31px;
}

.tasks-navigation {
  margin-bottom: 40px;
}

.tasks-list {
  border-radius: 4px;
  background: $gray-600;
  padding: 8px;
  // not sure why but this is necessary or the last task will overflow the container
  padding-bottom: 0.1px;
}

.tasks-column-title {
  margin-bottom: 8px;
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
      tasksTypes: Object.freeze([
        {type: 'habit', string: 'habits'},
        {type: 'daily', string: 'dailies'},
        {type: 'todo', string: 'todos'},
        {type: 'reward', string: 'rewards'},
      ]),
    };
  },
  computed: {
    ...mapState({tasks: 'tasks.data'}),
  },
};
</script>
