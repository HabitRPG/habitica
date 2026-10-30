<template>
  <div
    id="bailey"
    class="static-view bailey"
  >
    <small
      v-if="!post.published"
      class="draft"
    >DRAFT</small>
    <h2 class="title">
      {{ postDate }} - {{ (post.title || '').toUpperCase() }}
    </h2>

    <hr>

    <div v-html="renderedText"></div>
    <small>by {{ post.credits }}</small>
  </div>
</template>

<style lang='scss'>
@import '@/assets/scss/static.scss';
#bailey {
  .markdown-img-link {
    display: flex;
    align-items: center;

    img {
      margin-left: auto;
      margin-right: auto;
    }
  }
}
</style>

<style lang='scss' scoped>
@import '@/assets/scss/colors.scss';

.bailey {
  .title {
    display: inline;
  }

  .draft {
    margin-right: 10px;
  }

  h2 {
    color: $purple-200;
  }
}
</style>

<script>
import moment from 'moment';
import habiticaMarkdown from 'habitica-markdown';
import { mapState } from '@/libs/store';

export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    renderedText () {
      return habiticaMarkdown.unsafeHTMLRender(this.post.text || '');
    },
    postDate () {
      const format = this.user ? this.user.preferences.dateFormat.toUpperCase() : 'MM/DD/yyyy';
      return moment(this.post.publishDate).format(format);
    },
  },
};
</script>
