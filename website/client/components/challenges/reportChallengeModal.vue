<template lang="pug">
  b-modal#report-challenge(:title='$t("abuseFlagModalHeading")', size='lg', :hide-footer='true')
    .modal-body
      h4 {{ challenge.name }}
      blockquote
        div {{ challenge.summary }}
      p(v-html="$t('abuseFlagModalBody', abuseFlagModalBody)")
    .modal-footer
      button.pull-left.btn.btn-danger(@click='clearFlagCount()', v-if='userIsAdmin')
        | Reset Flag Count
      button.btn.btn-primary(@click='close()') {{ $t('cancel') }}
      button.btn.btn-danger(@click='reportAbuse()') {{ $t('abuseFlagModalButton') }}
</template>

<script>
import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  computed: {
    ...mapState({user: 'user.data'}),
    userIsAdmin () {
      return this.user.contributor.admin;
    },
  },
  data () {
    const abuseFlagModalBody = {
      firstLinkStart: '<a href="/static/community-guidelines" target="_blank">',
      secondLinkStart: '<a href="/static/terms" target="_blank">',
      linkEnd: '</a>',
    };
    return {
      abuseFlagModalBody,
      challenge: {},
    };
  },
  created () {
    this.$root.$on('habitica::report-challenge', data => {
      this.challenge = data.challenge;
      console.log(this.challenge);
      this.$root.$emit('bv::show::modal', 'report-challenge');
    });
  },
  destroyed () {
    this.$root.$off('habitica::report-challenge');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-challenge');
    },
    async reportAbuse () {
      this.notify('Thank you for reporting this violation. The moderators have been notified.');

      await this.$store.dispatch('challenge:flag', {
        challengeId: this.challenge._id,
      });

      this.close();
    },
    async clearFlagCount () {
      await this.$store.dispatch('challenge:clearFlagCount', {
        challengeId: this.challenge._id,
      });
      this.close();
    },
  },
};
</script>
