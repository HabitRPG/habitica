<template>
  <b-modal
    id="new-stuff"
    size="lg"
    :hide-header="true"
    :hide-footer="true"
    no-close-on-esc
    no-close-on-backdrop
    @shown="onShow()"
  >
    <div class="modal-body">
      <news-content ref="newsContent" />
    </div>

    <div class="modal-footer d-flex align-items-center pb-0">
      <a
        href="https://habitica.fandom.com/wiki/Whats_New"
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

<script>
import newsContent from './newsContent';

export default {
  components: {
    newsContent,
  },
  methods: {
    async onShow () {
      this.$refs.newsContent.getPosts();
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
