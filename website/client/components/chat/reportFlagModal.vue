<template lang="pug">
  b-modal#report-flag(:title='$t("abuseFlagModalHeading")', size='lg', :hide-footer='true')
    .modal-header
      h4(v-html="$t('abuseFlagModalHeading', reportData)")
    .modal-body
      blockquote
        div(v-markdown='abuseObject.text')
      p(v-html="$t('abuseFlagModalBody', abuseFlagModalBody)")
    .modal-footer
      button.pull-left.btn.btn-danger(@click='clearFlagCount()', v-if='user.contributor.admin && abuseObject.flagCount > 0')
        | Reset Flag Count
      button.btn.btn-primary(@click='close()') {{ $t('cancel') }}
      button.btn.btn-danger(@click='reportAbuse()') {{ $t('abuseFlagModalButton') }}
</template>

<script>
import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';
import markdownDirective from 'client/directives/markdown';

export default {
  mixins: [notifications],
  directives: {
    markdown: markdownDirective,
  },
  computed: {
    ...mapState({user: 'user.data'}),
    reportData () {
      let reportMessage = this.abuseObject.user;
      let isSystemMessage = this.abuseObject.uuid === 'system';
      if (isSystemMessage) reportMessage = this.$t('systemMessage');
      return {
        name: `<span class='text-danger'>${reportMessage}</span>`,
      };
    },
  },
  data () {
    let abuseFlagModalBody = {
      firstLinkStart: '<a href="/static/community-guidelines" target="_blank">',
      secondLinkStart: '<a href="/static/terms" target="_blank">',
      linkEnd: '</a>',
    };

    return {
      abuseFlagModalBody,
      abuseObject: '',
      groupId: '',
    };
  },
  created () {
    this.$root.$on('habitica::report-chat', data => {
      if (!data.message || !data.groupId) return;
      this.abuseObject = data.message;
      this.groupId = data.groupId;
      this.$root.$emit('bv::show::modal', 'report-flag');
    });
  },
  destroyed () {
    this.$root.$off('habitica::report-chat');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-flag');
    },
    async reportAbuse () {
      this.notify('Thank you for reporting this violation. The moderators have been notified.');
      await this.$store.dispatch('chat:flag', {
        groupId: this.groupId,
        chatId: this.abuseObject.id,
      });

      this.close();
    },
    async clearFlagCount () {
      await this.$store.dispatch('chat:clearFlagCount', {
        groupId: this.groupId,
        chatId: this.abuseObject.id,
      });
      this.close();
    },
  },
};
</script>
