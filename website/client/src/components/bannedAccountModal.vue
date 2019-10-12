<template>
  <b-modal
    id="banned-account"
    :title="$t('accountSuspendedTitle')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="row">
        <div class="col-12">
          <p v-markdown="bannedMessage"></p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('close') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
</style>

<script>
import markdownDirective from '@/directives/markdown';

const COMMUNITY_MANAGER_EMAIL = process.env.EMAILS_COMMUNITY_MANAGER_EMAIL; // eslint-disable-line

export default {
  directives: {
    markdown: markdownDirective,
  },
  computed: {
    bannedMessage () {
      const AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');
      const parseSettings = JSON.parse(AUTH_SETTINGS);
      const userId = parseSettings ? parseSettings.auth.apiId : '';

      return this.$t('accountSuspended', {
        userId,
        communityManagerEmail: COMMUNITY_MANAGER_EMAIL,
      });
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'banned-account');
    },
  },
};
</script>
