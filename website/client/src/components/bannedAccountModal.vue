<template lang="pug">
  b-modal#banned-account(:title="$t('accountSuspendedTitle')", size='md', :hide-footer="true")
    .modal-body
      .row
        .col-12
          p(v-markdown='bannedMessage')
    .modal-footer
      .col-12.text-center
          button.btn.btn-primary(@click='close()') {{$t('close')}}
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
