<template lang="pug">
div
  // @TODO: profile modal is pulled in on the header. So.. seems a little odd to depend on it that way, but for now let's depend
</template>

<script>
import profile from './profile';

export default {
  components: {
    profile,
  },
  mounted () {
    // @TODO: Do we need this page?
    this.$root.$emit('habitica:show-profile', {
      user: {},
      startingPage: 'profile',
    });
  },
};
</script>
