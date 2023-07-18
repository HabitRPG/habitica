<template>
  <b-modal
    id="report-challenge"
    size="md"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="modal-body">
      <div class="heading">
        <h5
          v-html="$t('abuseFlagModalHeading')"
        >
        </h5>
      </div>
      <blockquote>
        <div
          v-html="abuseObject.name"
        >
        </div>
      </blockquote>
      <div>
        <span class="why-report">{{ $t('whyReportingChallenge') }}</span>
        <textarea
          v-model="reportComment"
          class="form-control"
          :placeholder="$t('whyReportingChallengePlaceholder')"
        ></textarea>
      </div>
      <p v-html="$t('abuseFlagModalBodyChallenge', abuseFlagModalBody)"></p>
    </div>
    <div class="footer text-center">
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
      <button
        v-if="user.contributor.admin"
        class="reset-flag-count pull-left btn btn-danger"
        @click="clearFlagCount()"
      >
        Reset Flag Count
      </button>
    </div>
  </b-modal>
</template>

<style>
  #report-challenge h5 {
    color: #F23035;
  }

  .modal-header {
    border: none;
  }

</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

   .modal-body {
     margin-top: 0px;
     padding-top: 0px;
   }
  .heading h5 {
    margin-top: 16px;
    margin-bottom: 24px;
    color: $red-10;
    line-height: 1.4;
  }

  .why-report {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-50;
  }

   blockquote {
     border-radius: 4px;
     background-color: $gray-700;
     padding: 8px 0px 8px 16px;
     margin-top: 24px;
     font-weight: bold;
     color: $gray-10;
     height: 40px;
   }

   textarea {
     margin-top: 8px;
     margin-bottom: 16px;
     border-radius: 4px;
     border: solid 1px $gray-400;
     height: 64px;
     font-size: 14px;
   }

   .footer {
     padding: 1em;
     padding-bottom: 2em;
   }

   a.cancel-link {
     color: $blue-10;
     margin-right: .5em;
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
      this.$store.dispatch('challenges:flag', {
        challengeId: this.abuseObject.id,
        comment: this.reportComment,
      }).then(() => {
        this.text(this.$t('abuseReported'));
        this.close();
      }).catch(() => {});
    },
    async clearFlagCount () {
      await this.$store.dispatch('challenges:clearFlagCount', {
        challengeId: this.abuseObject.id,
      });
      this.close();
    },
    handleReport (data) {
      if (!data.challenge) return;
      this.abuseObject = data.challenge;
      this.reportComment = '';
      this.$root.$emit('bv::show::modal', 'report-challenge');
    },
  },
};
</script>
