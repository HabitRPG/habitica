<template lang="pug">
  .container
    .standard-page
      profile(:userId='userId', :startingPage='startingPage')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header {
    width: 100%;
  }
</style>

<script>
  import profile from './profile';

  export default {
    props: ['userId', 'startingPage'],
    components: {
      profile,
    },
  };
</script>
