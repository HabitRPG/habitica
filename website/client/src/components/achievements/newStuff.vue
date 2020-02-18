<template>
  <b-modal id='new-stuff'
    size='lg'
    :hide-header='true'
    :hide-footer='true'
    no-close-on-esc
    no-close-on-backdrop>
    <div class='modal-body'>
      <div class='bailey' v-for='(post, index) in posts'
              :key="index">
        <h2>{{ post.title }}</h2>
        <div v-markdown='post.text'></div>
        <small v-markdown='post.credits'></small>
      </div>
      </div>

    <div class='modal-footer'>
      <a class='btn btn-info' href='http://habitica.fandom.com/wiki/Whats_New' target='_blank'> {{ this.$t('newsArchive') }}</a>
      <button class='btn btn-secondary' @click='tellMeLater()'>{{ this.$t('tellMeLater') }}</button>
      <button class='btn btn-warning' @click='dismissAlert()'>{{ this.$t('dismissAlert') }}</button>
      </div>
  </b-modal>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
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
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      posts: [],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.posts = (await this.$store.dispatch('user:getNews')).data.data;
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
