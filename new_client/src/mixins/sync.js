export default {
  methods: {
    async sync () {
      this.$root.$emit('habitica::resync-requested');
      await Promise.all([
        this.$store.dispatch('user:fetch', {forceLoad: true}),
        this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
      ]);
      this.$root.$emit('habitica::resync-completed');
    },
  },
};
