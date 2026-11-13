<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="news-form-content">
      <h1>
        {{ isNew ? 'New Post' : 'Edit Post' }}
        <router-link
          class="btn btn-secondary float-right"
          :to="{ name: 'newsAdmin' }"
        >
          Back to List
        </router-link>
      </h1>
      <div
        v-if="loading"
        class="text-center"
      >
        Loading...
      </div>
      <div
        v-else
        class="row"
      >
        <div class="col-lg-6">
          <form @submit.prevent="savePost">
            <div class="form-group">
              <label for="news-title">Title</label>
              <input
                id="news-title"
                v-model="post.title"
                class="form-control"
                type="text"
                required
              >
            </div>
            <div class="form-row">
              <div class="form-group col-md-8">
                <label for="news-publish-date">Release Date</label>
                <input
                  id="news-publish-date"
                  v-model="publishDate"
                  class="form-control"
                  type="datetime-local"
                  required
                >
              </div>
              <div class="form-group col-md-4 d-flex align-items-end">
                <div class="custom-control custom-checkbox mb-2">
                  <input
                    id="news-published"
                    v-model="post.published"
                    class="custom-control-input"
                    type="checkbox"
                  >
                  <label
                    class="custom-control-label"
                    for="news-published"
                  >Published</label>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="news-text">Text (Markdown)</label>
              <textarea
                id="news-text"
                v-model="post.text"
                class="form-control text-input"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="news-credits">Credits</label>
              <input
                id="news-credits"
                v-model="post.credits"
                class="form-control"
                type="text"
                placeholder="e.g. Bailey and the Habitica Team"
                required
              >
            </div>
            <div class="d-flex">
              <button
                class="btn btn-primary mr-2"
                type="submit"
                :disabled="saving"
              >
                {{ isNew ? 'Create' : 'Save' }}
              </button>
              <router-link
                class="btn btn-secondary"
                :to="{ name: 'newsAdmin' }"
              >
                Cancel
              </router-link>
              <button
                v-if="!isNew"
                class="btn btn-danger ml-auto"
                type="button"
                :disabled="saving"
                @click="deletePost"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
        <div class="col-lg-6">
          <div class="preview">
            <h3>Preview</h3>
            <news-post :post="previewPost" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

  .news-form-content {
    flex: 0 0 100%;
    max-width: 1400px;
  }

  .text-input {
    min-height: 480px;
    font-family: monospace;
  }

  .preview {
    position: sticky;
    top: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    padding: 1rem;
    border: 1px solid $gray-500;
    border-radius: 4px;
    background: $white;
  }
</style>

<script>
import moment from 'moment';
import NewsPost from '@/components/news/newsPost';

const DATE_INPUT_FORMAT = 'YYYY-MM-DDTHH:mm';

function emptyPost () {
  return {
    title: '',
    credits: '',
    text: '',
    published: false,
    publishDate: new Date(),
  };
}

export default {
  components: {
    NewsPost,
  },
  data () {
    return {
      post: emptyPost(),
      loading: false,
      saving: false,
    };
  },
  computed: {
    isNew () {
      return !this.$route.params.postId;
    },
    // datetime-local inputs work with local time strings without a timezone
    publishDate: {
      get () {
        return moment(this.post.publishDate).format(DATE_INPUT_FORMAT);
      },
      set (value) {
        if (value) this.post.publishDate = moment(value, DATE_INPUT_FORMAT).toDate();
      },
    },
    previewPost () {
      return {
        ...this.post,
        title: this.post.title || 'Title',
      };
    },
  },
  watch: {
    '$route.params.postId': 'loadPost',
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('newsroom'),
    });
    this.loadPost();
  },
  methods: {
    async loadPost () {
      if (this.isNew) {
        this.post = emptyPost();
        return;
      }
      this.loading = true;
      try {
        this.post = await this.$store.dispatch('news:getPost', {
          postId: this.$route.params.postId,
        });
      } finally {
        this.loading = false;
      }
    },
    async savePost () {
      this.saving = true;
      const wasNew = this.isNew;
      try {
        const post = {
          _id: this.post._id,
          title: this.post.title,
          credits: this.post.credits,
          text: this.post.text,
          published: this.post.published,
          publishDate: this.post.publishDate,
        };
        if (wasNew) {
          const created = await this.$store.dispatch('news:createPost', { post });
          this.$router.replace({ name: 'newsPostEdit', params: { postId: created._id } });
        } else {
          this.post = await this.$store.dispatch('news:updatePost', { post });
        }
        await this.$store.dispatch('snackbars:add', {
          title: '',
          text: wasNew ? 'News post created' : 'News post saved',
          type: 'info',
        });
      } finally {
        this.saving = false;
      }
    },
    async deletePost () {
      if (!window.confirm('Are you sure you want to delete this news post?')) {
        return;
      }
      this.saving = true;
      try {
        await this.$store.dispatch('news:deletePost', { postId: this.post._id });
        this.$router.push({ name: 'newsAdmin' });
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
