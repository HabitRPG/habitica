<template>
  <b-modal
    id="new-stuff"
    size="lg"
    :hide-header="true"
    :hide-footer="true"
    no-close-on-esc="no-close-on-esc"
    no-close-on-backdrop="no-close-on-backdrop"
  >
    <div class="modal-body">
      <div
        class="static-view"
        v-html="html"
      ></div>
    </div>
    <div class="modal-footer d-flex align-items-center pb-0">
      <a
        href="http://habitica.fandom.com/wiki/Whats_New"
        target="_blank"
        class="mr-auto"
      >{{ this.$t('newsArchive') }}</a>
      <button
        class="btn btn-secondary ml-auto"
        @click="tellMeLater()"
      >
        {{ this.$t('tellMeLater') }}
      </button>
      <button
        class="btn btn-primary"
        @click="dismissAlert();"
      >
        {{ this.$t('dismissAlert') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang='scss'>
  @import '~@/assets/scss/static.scss';
  #new-stuff {
    .modal-body .modal-body {
      padding-top: 0rem;
    }
  }
</style>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      html: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.$root.$on('bv::show::modal', async modalId => {
      if (modalId !== 'new-stuff') return;
      const response = await axios.get('/api/v4/news');
      this.html = response.data.html;
    });
  },
  beforeDestroy () {
    this.$root.$off('bv::show::modal');
  },
  methods: {
    tellMeLater () {
      this.$store.dispatch('user:newStuffLater');
      this.$root.$emit('bv::hide::modal', 'new-stuff');
    },
    dismissAlert () {
      this.$store.dispatch('user:set', { 'flags.newStuff': false });
      this.$root.$emit('bv::hide::modal', 'new-stuff');
    },
  },
};
</script>
