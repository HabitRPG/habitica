<template>
  <b-modal
    id="report-profile"
    :title="$t('reportPlayer')"
    :hide-footer="!hasPermission(user, 'moderator')"
    size="md"
  >
    <div slot="modal-header">
      <h2 class="mt-2 mb-0">
        {{ $t('reportPlayer') }}
      </h2>
      <close-x
        @close="close()"
      />
    </div>
    <div>
      <blockquote>
        <strong> {{ displayName }} </strong>
        <p class="mb-0">
          {{ username }}
        </p>
      </blockquote>
      <div>
        <strong>{{ $t('whyReportingPlayer') }}</strong>
        <textarea
          v-model="reportComment"
          class="mt-2 form-control"
          :placeholder="$t('whyReportingPlayerPlaceholder')"
        ></textarea>
      </div>
      <p
        class="mb-2"
        v-html="$t('playerReportModalBody', abuseFlagModalBody)"
      >
      </p>
    </div>
    <div class="footer text-center d-flex flex-column">
      <button
        class="btn btn-danger mx-auto mb-3"
        :disabled="!reportComment"
        :class="{ disabled: !reportComment }"
        @click="reportAbuse()"
      >
        {{ $t('report') }}
      </button>
      <a
        class="cancel-link"
        @click.prevent="close()"
      >{{ $t('cancel') }}</a>
    </div>
    <div
      slot="modal-footer"
    >
      <div
        class="d-flex"
        @click="resetFlags()"
      >
        <div
          v-once
          class="svg-icon icon-16 color my-auto mr-2"
          v-html="icons.report"
        ></div>
        <a>Reset Flags</a>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  #report-profile {
    .modal-header {
      padding: 24px;
      border-bottom: none;
    }
    .modal-body {
      padding: 0px 24px 24px 24px;
    }
    .modal-footer {
      color: $maroon-50;
      display: flex;
      justify-content: center;
      border-top: none;
      height: 48px;
      background-color: rgba($red-500, 0.25);
      margin-top: -8px;
      padding: 0px;
      a {
        margin-top: 2px;
        color: $maroon-50;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  strong, p {
    line-height: 1.71;
  }

  h2 {
    color: $maroon-100;
  }

  blockquote {
    border-radius: 4px;
    background-color: $gray-700;
    padding: .5rem 1rem;
  }

  textarea {
    margin-top: 1em;
    margin-bottom: 1em;
    border-radius: 2px;
    border: solid 1px $gray-400;
    min-height: 106px;
  }

  .footer {
    padding: 1rem 1rem 0rem 1rem;
  }
</style>

<script>
import closeX from '@/components/ui/closeX';
import notifications from '@/mixins/notifications';
import markdownDirective from '@/directives/markdown';
import { userStateMixin } from '../../mixins/userState';
import report from '@/assets/svg/report.svg';

export default {
  components: {
    closeX,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [notifications, userStateMixin],
  data () {
    const abuseFlagModalBody = {
      firstLinkStart: '<a href="/static/community-guidelines" target="_blank">',
      secondLinkStart: '<a href="/static/terms" target="_blank">',
      linkEnd: '</a>',
    };

    return {
      abuseFlagModalBody,
      displayName: '',
      username: '',
      reportComment: '',
      icons: Object.freeze({
        report,
      }),
    };
  },
  mounted () {
    this.$root.$on('habitica::report-profile', this.handleReport);
  },
  beforeDestroy () {
    this.$root.$off('habitica::report-profile', this.handleReport);
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-profile');
    },
    async reportAbuse () {
      const result = await this.$store.dispatch('members:reportMember', {
        memberId: this.memberId,
        source: this.$route.fullPath,
        comment: this.reportComment,
      });
      if (result.status === 200) {
        this.text(this.$t('abuseReported'));

        this.$root.$emit('habitica:report-profile-result', result.data.data);
      } else {
        this.error(result.statusText);
      }

      this.close();
    },
    handleReport (data) {
      if (!data.memberId) return;
      this.displayName = data.displayName;
      this.username = `@${data.username}`;
      this.memberId = data.memberId;
      this.reportComment = '';
      this.$root.$emit('bv::show::modal', 'report-profile');
    },
    async resetFlags () {
      const result = await this.$store.dispatch('members:clearMemberFlags', {
        memberId: this.memberId,
      });
      if (result.status === 200) {
        this.text('Flags cleared.');
      } else {
        this.err(result.statusText);
      }
      this.close();
    },
  },
};
</script>
