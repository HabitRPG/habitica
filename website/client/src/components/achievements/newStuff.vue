<template>
  <b-modal id='new-stuff'
    size='lg'
    :hide-header='true'
    :hide-footer='true'
    no-close-on-esc
    no-close-on-backdrop>
    <div class='modal-body'>
      <div :class="index == (posts.length - 1) ? 'bailey bailey-last' : 'bailey'"
      v-for='(post, index) in posts'
              :key="index">
        <small v-if='!post.published' class='draft'>DRAFT</small><h2 class='title'>
          {{ post.publishDate}} - {{ post.title }}
        </h2>
        <hr>
        <div class='markdown' v-html='renderMarkdown(post.text)'></div>
        <small>{{ post.credits }}</small>
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
  margin-bottom: 60px;
  .title {
    display: inline;
  }

  .draft {
    margin-right: 10px;
  }

  h2 {
    color: #4F2A93;
  }

  div {
    font-size: 16px;
  }

  .center-block {
    display: block;
    margin: auto;
  }
}
.bailey-last {
  margin-bottom: 10px;
}
</style>

<style>
  .bailey .markdown-img {
    display: block;
    margin: auto;
  }

  .bailey .markdown h1 {
    color: #4F2A93 !important;
    font-size: 2.5rem !important;
    margin-top: 4rem !important;
    margin-bottom: 1rem !important;
  }

  .bailey .markdown h2 {
    color: #4F2A93 !important;
    font-size: 2rem !important;
    margin-top: 3.5rem !important;
    margin-bottom: 1rem !important;
  }

  .bailey .markdown h3 {
    color: #4F2A93 !important;
    font-size: 1.75rem !important;
    margin-top: 3rem !important;
    margin-bottom: 1rem !important;
  }

  .bailey .markdown h4 {
    color: #4F2A93 !important;
    font-size: 1.5rem !important;
    margin-top: 2rem !important;
    margin-bottom: 1rem !important;
  }

  .bailey div {
    font-size: 16px;
  }

  .bailey .center-block {
    display: block;
    margin: auto;
  }
</style>

<script>
import habiticaMarkdown from 'habitica-markdown';
import { mapState } from '@/libs/store';

export default {
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
    renderMarkdown (text) {
      return habiticaMarkdown.unsafeHTMLRender(text);
    },
  },
};
</script>
