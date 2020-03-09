<template>
  <b-modal
    id="report-challenge"
    :title="$t('abuseFlagModalHeading')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-body">
      <strong v-html="$t('abuseFlagModalHeading', reportData)"></strong>
      <blockquote>
        <div v-markdown="abuseObject.name"></div>
      </blockquote>
      <div>
        <strong>{{ $t('whyReportingChallenge') }}</strong>
        <span class="optional">{{ $t('optional') }}</span>
        <textarea
          v-model="reportComment"
          class="form-control"
          :placeholder="$t('whyReportingChallengePlaceholder')"
        ></textarea>
      </div>
      <small v-html="$t('abuseFlagModalBodyChallenge', abuseFlagModalBody)"></small>
    </div>
    <div class="footer text-center">
      <button
        v-if="user.contributor.admin"
        class="reset-flag-count pull-left btn btn-danger"
        @click="clearFlagCount()"
      >
        Reset Flag Count
      </button>
      <a
        class="cancel-link"
        @click.prevent="close()"
      >{{ $t('cancel') }}</a>
      <button
        class="btn btn-danger"
        @click="reportAbuse()"
      >
        {{ $t('report') }}
      </button>
    </div>
  </b-modal>
</template>

<style>
  #report-flag h5 {
    color: #f23035;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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

   .reset-flag-count {
     margin-right: .5em;
   }
</style>

<script>
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [notifications],
  data () {
    const abuseFlagModalBody = {
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
  computed: {
    ...mapState({ user: 'user.data' }),
    reportData () {
      const reportMessage = this.abuseObject.user;
      return {
        name: `<span class='text-danger'>${reportMessage}</span>`,
      };
    },
  },
  created () {
    this.$root.$on('habitica::report-challenge', this.handleReport);
  },
  destroyed () {
    this.$root.$off('habitica::report-challenge', this.handleReport);
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-challenge');
    },
    async reportAbuse () {
      this.text(this.$t('abuseReported'));

      const result = await this.$store.dispatch('challenges:flag', {
        challengeId: this.abuseObject.id,
        comment: this.reportComment,
      });

      this.$root.$emit('habitica:report-result', result);

      this.close();
    },
    async clearFlagCount () {
      await this.$store.dispatch('challenges:clearFlagCount', {
        challengeId: this.abuseObject.id,
      });
      this.close();
    },
    handleReport (data) {
      console.log(data);
      if (!data.challenge) return;
      this.abuseObject = data.challenge;
      this.reportComment = '';
      this.$root.$emit('bv::show::modal', 'report-challenge');
    },
  },
};
</script>
