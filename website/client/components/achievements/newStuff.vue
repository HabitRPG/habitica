<template lang="pug">
  b-modal#new-stuff(
    size='lg',
    :hide-header='true',
    :hide-footer='true',
  )
    .modal-body
      div(v-html='html')
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-secondary(@click='tellMeLater()') {{ this.$t('tellMeLater') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

  .modal-body {
    padding-top: 2em;
  }
</style>

<script>
  import axios from 'axios';
  import { mapState } from 'client/libs/store';
  import markdown from 'client/directives/markdown';
  import newStuff from 'client/components/static/newStuff';

  export default {
    data () {
      return {
        html: '',
      };
    },
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
        let response = await axios.get('/api/v3/news');
        this.html = response.data.html;
      });
    },
    destroyed () {
      this.$root.$off('bv::show::modal');
    },
    methods: {
      tellMeLater () {
        this.$store.dispatch('user:newStuffLater');
        this.$root.$emit('bv::hide::modal', 'new-stuff');
      },
      dismissAlert () {
        this.$store.dispatch('user:set', {'flags.newStuff': false});
        this.$root.$emit('bv::hide::modal', 'new-stuff');
      },
    },
  };
</script>
