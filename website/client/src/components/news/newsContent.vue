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
      <div class="ml-auto" v-if="hasPermission(user, 'news')">
      <label class="mr-3">
        <input
          type="checkbox"
          :checked="showDrafts"
          @change="toggleShowDrafts"
        />
        {{ $t('showDrafts') }}
      </label>
      <label>
        <input
          type="checkbox"
          :checked="showScheduled"
          @change="toggleShowScheduled"
        />
        {{ $t('showScheduled') }}
      </label>
      </div>
    </div>
    <news-post
      v-for="(post, index) in posts"
      :key="post._id"
      :post="post"
      class="bailey-post"
      :class="{'bailey-last': index == (posts.length - 1)}"
    />
  </div>
</template>

<style lang='scss' scoped>
@import '@/assets/scss/colors.scss';

h1 {
  color: $purple-200;
  margin-bottom: 0;
}

.bailey-post {
  margin-bottom: 1rem;

  &.bailey-last {
    margin-bottom: 0;
  }
}
</style>

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';
import seasonalNPC from '@/mixins/seasonalNPC';
import { userStateMixin } from '../../mixins/userState';
import NewsPost from './newsPost';

export default {
  components: {
    NewsPost,
  },
  mixins: [seasonalNPC, userStateMixin],
  data () {
    return {
      posts: [],
      showDrafts: false,
      showScheduled: false,
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

      // If the user is authorized, show any draft
      if (this.user && (this.hasPermission(this.user, 'news'))) {
        this.posts = postsFromServer
            .filter(p => (this.showDrafts || p.published) && (this.showScheduled || (moment().isAfter(p.publishDate))));
      } else {
        // Show the last published post + any draft for the authorized users
        this.posts = [];

        const lastPublishedPost = postsFromServer
          .find(p => p.published && moment().isAfter(p.publishDate));

        if (lastPublishedPost) this.posts.push(lastPublishedPost);
      }
    },
    toggleShowDrafts () {
      this.showDrafts = !this.showDrafts;
      this.getPosts();
    },
    toggleShowScheduled () {
      this.showScheduled = !this.showScheduled;
      this.getPosts();
    },
  },
};
</script>
