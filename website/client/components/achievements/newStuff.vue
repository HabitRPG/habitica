<template lang="pug">
  b-modal#new-stuff(
    v-if='user.flags.newStuff',
    size='lg',
    :hide-header='true',
    :hide-footer='true',
  )
    .modal-body
      new-stuff
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-secondary(@click='close()') {{ this.$t('cool') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

  .modal-body {
    padding-top: 2em;
  }
</style>

<script>
  import { mapState } from 'client/libs/store';
  import markdown from 'client/directives/markdown';
  import newStuff from 'client/components/static/newStuff';

  export default {
    components: {
      newStuff,
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    directives: {
      markdown,
    },
    mounted () {
      this.$root.$on('bv::show::modal', async (modalId) => {
        if (modalId !== 'new-stuff') return;
        // Request the lastest news, but not locally incase they don't refresh
        // let response = await axios.get('/static/new-stuff');
      });
    },
    destroyed () {
      this.$root.$off('bv::show::modal');
    },
    methods: {
      close () {
        this.$root.$emit('bv::hide::modal', 'new-stuff');
      },
      dismissAlert () {
        this.$store.dispatch('user:set', {'flags.newStuff': false});
        this.close();
      },
    },
  };
</script>
