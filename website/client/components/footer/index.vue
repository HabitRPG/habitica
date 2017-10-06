<template lang="pug">
component(:is="footerComponent")
</template>

<script>
import StandardFooter from './standard';
import CompactFooter from './compact';

export default {
  components: {
    StandardFooter,
    CompactFooter,
  },
  computed: {
    footerComponent () {
      return this.$route.name === 'tasks' ? 'CompactFooter' : 'StandardFooter';
    },
  },
};
</script>
