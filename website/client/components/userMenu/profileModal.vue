<template lang="pug">
  b-modal#profile(size='lg', :hide-footer="true", :hide-header="true", @hidden="onHidden", @shown="onShown()")
    profile(:userId='userId', :startingPage='startingPage', style="margin-top:24px;")
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
    components: {
      profile,
    },
    data () {
      return {
        userId: undefined,
        startingPage: undefined,
        path: undefined,
      };
    },
    mounted () {
      this.$root.$on('habitica:show-profile', (data) => {
        this.userId = data.userId;
        this.startingPage = data.startingPage || 'profile';
        this.path = data.path;
        this.$root.$emit('bv::show::modal', 'profile');
      });
    },
    destroyed () {
      this.$root.$off('habitica:show-profile');
    },
    methods: {
      onShown () {
        history.pushState('', null, this.path);
      },
      onHidden () {
        if (this.$route.path !== window.location.pathname) {
          this.$router.go(-1);
        }
      },
    },
  };
</script>
