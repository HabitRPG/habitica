<template>
  <div class="container">
    <div class="standard-page">
      <profile
        :user-id="userId"
        :starting-page="startingPage"
      />
    </div>
  </div>
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
  props: {
    userId: String,
    startingPage: {
      type: String,
      default: 'profile',
    },
  },
};
</script>
