<template lang="pug">
  .container
    .standard-page
      profile(:userId='userId', :startingPage='startingPage')
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .header {
    width: 100%;
  }
</style>

<script>
import profile from './profile';

export default {
  components: {
    profile,
  },
  props: ['userId', 'startingPage'],
};
</script>
