import { EVENTS } from '@/libs/events';

export default {
  methods: {
    async sync () {
      this.$root.$emit(EVENTS.RESYNC_REQUESTED);
      if (this.$route.fullPath.indexOf('task-information') !== -1) {
        this.$root.$emit('habitica:team-sync');
      }
      await Promise.all([
        this.$store.dispatch('user:fetch', { forceLoad: true }),
        this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true }),
      ]);
      if (this.$store.state.user.data.party._id) {
        await this.$store.dispatch('party:getMembers', { forceLoad: true });
      }
      this.$root.$emit(EVENTS.RESYNC_COMPLETED);
    },
  },
};
