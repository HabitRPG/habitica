<template lang="pug">
.tasks-column.col-3
  h2.tasks-column-title(v-once) {{ $t(types[type].label) }}
  .tasks-list
    task(v-for="task in tasks[`${type}s`]", :key="task.id", :task="task")
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

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
  props: ['type'],
  data () {
    return Object.freeze({
      types: {
        habit: {
          string: 'habits',
        },
        daily: {
          label: 'dailies',
        },
        todo: {
          label: 'todos',
        },
        reward: {
          label: 'rewards',
        },
      },
    });
  },
  computed: {
    ...mapState({tasks: 'tasks.data'}),
  },
};
</script>
