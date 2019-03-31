<template lang="pug">
  b-modal#new-stuff(
    size='lg',
    :hide-header='true',
    :hide-footer='true',
    no-close-on-esc,
    no-close-on-backdrop
  )
    .modal-body
      .static-view(v-html='html')
    .modal-footer
      a.btn.btn-info(href='http://habitica.fandom.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-secondary(@click='tellMeLater()') {{ this.$t('tellMeLater') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.modal-body {
  padding-top: 2em;
}
</style>

<script>
  import axios from 'axios';
  import { mapState } from 'client/libs/store';

  export default {
    data () {
      return {
        html: '',
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    async mounted () {
      this.$root.$on('bv::show::modal', async (modalId) => {
        if (modalId !== 'new-stuff') return;
        let response = await axios.get('/api/v4/news');
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
