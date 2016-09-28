<template lang="pug">
div
  p {{ msg }}
  p Welcome back {{profileName}}!
  p You have {{tasksCount}} tasks!
</template>

<script>
export default {
  data () {
    return {
      msg: 'You\'re on the Home page!',
    };
  },
  computed: {
    tasksCount () {
      return this.$store.state.tasks.length;
    },
    profileName () {
      return this.$store.getters.profileName;
    },
  },
};
</script>