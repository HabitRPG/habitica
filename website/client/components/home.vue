<template lang="pug">
div
  p {{ msg }}
  p Welcome back {{profileName}}!
  p You have {{tasksCount}} tasks!
</template>

<script>
import { mapState, mapGetters } from '../store';

export default {
  data () {
    return {
      msg: 'You\'re on the Home page!',
    };
  },
  computed: {
    ...mapState({
      tasksCount: (state) => state.tasks.length,
    }),
    ...mapGetters(['profileName']),
  },
};
</script>