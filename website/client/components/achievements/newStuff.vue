<template lang="pug">
  b-modal#new-stuff(
    size='lg',
    :hide-header='true',
    :hide-footer='true',
    no-close-on-esc,
    no-close-on-backdrop
  )
    .modal-body
      .bailey(v-for='(post, index) in posts')
        h2 {{ post.title }}
        div(v-markdown='post.text')
        small(v-markdown='post.credits')

    .modal-footer
      a.btn.btn-info(href='http://habitica.fandom.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-secondary(@click='tellMeLater()') {{ this.$t('tellMeLater') }}
      button.btn.btn-warning(@click='dismissAlert()') {{ this.$t('dismissAlert') }}
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.modal-body {
  padding-top: 2em;
}
.bailey {
  margin-bottom: 50px;

  h2 {
    color: #4F2A93;
  }

  div {
    font-size: 16px;
  }
}
</style>

<style>
  .bailey .markdown-img {
    display: block;
    margin: auto;
  }
</style>

<script>
  import { mapState } from 'client/libs/store';
  import markdownDirective from 'client/directives/markdown';

  export default {
    data () {
      return {
        posts: [],
      };
    },
    directives: {
      markdown: markdownDirective,
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    async mounted () {
      this.posts = await this.$store.dispatch('news:getNews');
      if (this.posts.length > 2) {
        this.posts = this.posts.slice(0, 2);
      }
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
        this.$store.dispatch('user:newStuffRead');
        this.$root.$emit('bv::hide::modal', 'new-stuff');
      },
    },
  };
</script>
