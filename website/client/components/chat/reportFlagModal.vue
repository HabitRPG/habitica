<template lang="pug">
  b-modal#report-flag(:title='$t("abuseFlagModalHeading")', size='md', :hide-footer='true')
    .modal-body
      strong(v-html="$t('abuseFlagModalHeading', reportData)")
      blockquote
        div(v-markdown='abuseObject.text')
      div
        strong {{$t('whyReportingPost')}}
        span.optional {{$t('optional')}}
        textarea.form-control(v-model='reportComment', :placeholder='$t("whyReportingPostPlaceholder")')
      small(v-html="$t('abuseFlagModalBody', abuseFlagModalBody)")
    .footer.text-center
      button.pull-left.btn.btn-danger(@click='clearFlagCount()', v-if='user.contributor.admin && abuseObject.flagCount > 0')
        | Reset Flag Count
      a.cancel-link(@click.prevent='close()') {{ $t('cancel') }}
      button.btn.btn-danger(@click='reportAbuse()') {{ $t('report') }}
</template>

<style>
  #report-flag h5 {
    color: #f23035;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

   .modal-body {
     margin-top: 1em;
   }

   blockquote {
     border-radius: 2px;
     background-color: #f4f4f4;
     padding: 1em;
     margin-top: 1em;
   }

   textarea {
     margin-top: 1em;
     margin-bottom: 1em;
     border-radius: 2px;
     border: solid 1px $gray-400;
     min-height: 106px;
   }

   .footer {
     padding: 1em;
     padding-bottom: 2em;
   }

   a.cancel-link {
     color: $blue-10;
     margin-right: .5em;
   }

   .optional {
     color: $gray-200;
     float: right;
   }
</style>

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
      reportComment: '',
    };
  },
  created () {
    this.$root.$on('habitica::report-chat', this.handleReport);
  },
  destroyed () {
    this.$root.$off('habitica::report-chat', this.handleReport);
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-flag');
    },
    async reportAbuse () {
      this.text(this.$t(this.groupId === 'privateMessage' ? 'pmReported' : 'abuseReported'));

      let result = await this.$store.dispatch('chat:flag', {
        groupId: this.groupId,
        chatId: this.abuseObject.id,
        comment: this.reportComment,
      });

      this.$root.$emit('habitica:report-result', result);

      this.close();
    },
    async clearFlagCount () {
      await this.$store.dispatch('chat:clearFlagCount', {
        groupId: this.groupId,
        chatId: this.abuseObject.id,
      });
      this.close();
    },
    handleReport (data) {
      if (!data.message || !data.groupId) return;
      this.abuseObject = data.message;
      this.groupId = data.groupId;
      this.reportComment = '';
      this.$root.$emit('bv::show::modal', 'report-flag');
    },
  },
};
</script>
