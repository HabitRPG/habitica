<template lang="pug">
.row
  .col-3(v-for="taskType in tasksTypes")
    h3 {{taskType}}s
    ul
      task(v-for="task in tasks", v-if="task.type === taskType", :key="task.id", :task="task")
</template>

<script>
import Task from './task';
import { mapState } from 'client/libs/store';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import toggleSwitch from 'client/components/ui/toggleSwitch';

export default {
  components: {
    Task,
    bDropdown,
    bDropdownItem,
    toggleSwitch,
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
