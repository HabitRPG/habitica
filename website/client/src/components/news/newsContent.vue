<template>
  <div>
    <div class="bailey-header d-flex align-items-center mb-3">
      <div
        class="mr-3"
        :class="npcClass('bailey')"
      ></div>
      <h1 v-once>
        {{ $t('newStuff') }}
      </h1>
    </div>
    <div
      v-for="(post, index) in posts"
      :key="post._id"
      class="static-view bailey"
      :class="{'bailey-last': index == (posts.length - 1)}"
    >
      <small
        v-if="!post.published"
        class="draft"
      >DRAFT</small>
      <h2 class="title">
        {{ getPostDate(post) }} - {{ post.title.toUpperCase() }}
      </h2>

      <hr>

      <div v-html="renderMarkdown(post.text)"></div>
      <small>by {{ post.credits }}</small>
    </div>
  </div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
@import '~@/assets/scss/colors.scss';

h1 {
  color: $purple-200;
  margin-bottom: 0;
}

.bailey {
  margin-bottom: 1rem;

  &.bailey-last {
    margin-bottom: 0;
  }

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
import seasonalNPC from '@/mixins/seasonalNPC';

export default {
  mixins: [seasonalNPC],
  data () {
    return {
      posts: [],
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    async getPosts () {
      const postsFromServer = await this.$store.dispatch('news:fetch');

      // Show the last published post + any draft for the authorized users
      this.posts = [];

      const lastPublishedPost = postsFromServer
        .find(p => p.published && moment().isAfter(p.publishDate));

      if (lastPublishedPost) this.posts.push(lastPublishedPost);

      // If the user is authorized, show any draft
      if (this.user && this.user.contributor.newsPoster) {
        this.posts.unshift(
          ...postsFromServer
            .filter(p => !p.published || moment().isBefore(p.publishDate)),
        );
      }
    },
    renderMarkdown (text) {
      return habiticaMarkdown.unsafeHTMLRender(text);
    },
    getPostDate (post) {
      const format = this.user ? this.user.preferences.dateFormat.toUpperCase() : 'MM/DD/yyyy';
      return moment(post.publishDate).format(format);
    },
  },
};
</script>
