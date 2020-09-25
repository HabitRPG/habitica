<template>
  <b-modal
    id="new-stuff"
    size="lg"
    :hide-header="true"
    :hide-footer="true"
    no-close-on-esc
    no-close-on-backdrop
    @show="onShow()"
  >
    <div class="modal-body">
      <div class="bailey-header d-flex align-items-center mb-3">
        <div class="npc_bailey mr-3"></div>
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

    <div class="modal-footer d-flex align-items-center pb-0">
      <a
        href="http://habitica.fandom.com/wiki/Whats_New"
        target="_blank"
        class="mr-auto"
      >{{ $t('newsArchive') }}</a>
      <button
        class="btn btn-secondary ml-auto"
        @click="tellMeLater()"
      >
        {{ $t('tellMeLater') }}
      </button>
      <button
        class="btn btn-primary"
        @click="dismissAlert()"
      >
        {{ $t('dismissAlert') }}
      </button>
    </div>
  </b-modal>
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

export default {
  data () {
    return {
      posts: [],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    async onShow () {
      this.posts = await this.$store.dispatch('news:fetch');
      if (this.posts.length > 2) {
        this.posts = this.posts.slice(0, 2);
      }
    },
    renderMarkdown (text) {
      return habiticaMarkdown.unsafeHTMLRender(text);
    },
    getPostDate (post) {
      return moment(post.publishedDate).format(this.user.preferences.dateFormat.toUpperCase());
    },
    tellMeLater () {
      this.$store.dispatch('news:remindMeLater');
      this.$root.$emit('bv::hide::modal', 'new-stuff');
    },
    dismissAlert () {
      this.$store.dispatch('news:markAsRead');
      this.$root.$emit('bv::hide::modal', 'new-stuff');
    },
  },
};
</script>
