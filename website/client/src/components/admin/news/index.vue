<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="news-content">
      <h1>
        {{ $t('newsroom') }}
        <router-link
          class="btn btn-primary float-right"
          :to="{ name: 'newsPostCreate' }"
        >
          New Post
        </router-link>
      </h1>
      <table class="table table-bordered table-hover bg-white">
        <thead>
          <tr>
            <th>Title</th>
            <th class="status-col">
              Status
            </th>
            <th class="date-col">
              Release Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post._id"
            class="post-row"
            @click="openPost(post._id)"
          >
            <td>
              <router-link
                :to="{ name: 'newsPostEdit', params: { postId: post._id } }"
                @click.native.stop
              >
                {{ post.title }}
              </router-link>
            </td>
            <td>
              <span
                class="badge"
                :class="getStatus(post).badgeClass"
              >{{ getStatus(post).label }}</span>
            </td>
            <td>{{ formatDate(post.publishDate) }}</td>
          </tr>
          <tr v-if="!loading && posts.length === 0">
            <td
              colspan="3"
              class="text-center"
            >
              No news posts yet.
            </td>
          </tr>
        </tbody>
      </table>
      <div class="text-center">
        <button
          v-if="hasMore"
          class="btn btn-secondary"
          :disabled="loading"
          @click="loadPosts()"
        >
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .news-content {
    flex: 0 0 100%;
    max-width: 1200px;
  }

  td {
    font-size: 1rem;
  }

  .post-row {
    cursor: pointer;
  }

  .status-col {
    width: 140px;
  }

  .date-col {
    width: 220px;
  }
</style>

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';

// Matches POSTS_PER_PAGE on the server
const POSTS_PER_PAGE = 10;

export default {
  data () {
    return {
      posts: [],
      page: 0,
      hasMore: false,
      loading: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('newsroom'),
    });
    this.loadPosts();
  },
  methods: {
    async loadPosts () {
      this.loading = true;
      try {
        const posts = await this.$store.dispatch('news:getPosts', { page: this.page });
        this.posts.push(...posts);
        this.hasMore = posts.length === POSTS_PER_PAGE;
        this.page += 1;
      } finally {
        this.loading = false;
      }
    },
    openPost (postId) {
      this.$router.push({ name: 'newsPostEdit', params: { postId } });
    },
    getStatus (post) {
      if (!post.published) return { label: 'Draft', badgeClass: 'badge-secondary' };
      if (moment().isBefore(post.publishDate)) return { label: 'Scheduled', badgeClass: 'badge-warning' };
      return { label: 'Published', badgeClass: 'badge-success text-white' };
    },
    formatDate (date) {
      const format = this.user ? this.user.preferences.dateFormat.toUpperCase() : 'MM/DD/YYYY';
      return moment(date).format(`${format} HH:mm`);
    },
  },
};
</script>
