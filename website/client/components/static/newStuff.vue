<template lang='pug'>
div
  .static-view.bailey(v-for='(post) in posts')
    h2 {{ post.title }}
    div(v-if='post.text' v-markdown='post.text', target='_blank')
    small(v-if='post.credits' v-markdown='post.credits', target='_blank')
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
.bailey {
  margin-bottom: 40px;
}
.bailey h2 {
  color: #4F2A93;
}
.bailey div {
  font-size: 16px;
}
.bailey img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>

<script>
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
  async mounted () {
    this.posts = await this.$store.dispatch('news:getNews');
  },
};
</script>
