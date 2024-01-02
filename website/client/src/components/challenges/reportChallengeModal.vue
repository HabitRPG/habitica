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
      <div>
        <span
          class="svg-icon close-icon icon-16 color"
          aria-hidden="true"
          tabindex="0"
          @click="close()"
          @keypress.enter="close()"
          v-html="icons.close"
        ></span>
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
      <p
        class="report-guidelines"
        v-html="$t('abuseFlagModalBodyChallenge', abuseFlagModalBody)"
      >
      </p>
    </div>
    <div class="buttons text-center">
      <div class="button-spacing">
        <button
          class="btn btn-danger"
          :class="{disabled: !reportComment}"
          @click="reportAbuse()"
        >
          {{ $t('report') }}
        </button>
      </div>
      <div class="button-spacing">
        <a
          class="cancel-link"
          @click.prevent="close()"
        >
          {{ $t('cancel') }}
        </a>
      </div>
    </div>
    <div
      v-if="hasPermission(user, 'moderator')"
      class="reset-flag-count d-flex justify-content-center align-items-middle"
      @click="clearFlagCount()"
    >
      <div
        v-once
        class="svg-icon icon-16 color ml-auto mr-2 my-auto"
        v-html="icons.report"
      ></div>
      <div
        class="mr-auto my-auto"
        @click="clearFlagCount()"
      >
        {{ $t('resetFlags') }}
      </div>
    </div>
  </b-modal>
</template>

<style>
  #report-challenge {
    h5 {
      color: #F23035;
    }

    .modal-header {
      border: none;
      padding-bottom: 0px;
      padding-top: 12px;
      height: 16px;
      align-content: center;
    }

    .modal-content {
      padding: 0px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .modal-body {
    padding: 0px 8px 0px 8px;
  }

  span.svg-icon.close-icon.icon-16 {
    height: 16px;
    width: 16px;
    margin-top: -32px;
    margin-right: -16px;
  }

  .close-icon {
    color: $gray-300;
    stroke-width: 0px;

    &:hover {
      color: $gray-200;
    }
  }

  .heading h5 {
    margin-bottom: 24px;
    margin-top: 16px;
    color: $red-10;
    line-height: 1.4;
  }

  .why-report {
    font-size: 1em;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-50;
  }

  .report-guidelines {
    line-height: 1.71;
    padding-bottom: 8px;
  }

   blockquote {
     border-radius: 4px;
     background-color: $gray-700;
     padding: 8px 16px 8px 16px;
     margin-top: 24px;
     font-weight: bold;
     color: $gray-10;
     height: max-conent;;
   }

   textarea {
     margin-top: 8px;
     margin-bottom: 16px;
     border-radius: 4px;
     border: solid 1px $gray-400;
     height: 64px;
     font-size: 1em;
   }

   .btn {
     width: 75px;
   }

   .buttons {
     padding: 0 16px 0 16px;
     margin-bottom: 16px;
   }

   .button-spacing {
     margin-bottom: 16px;
   }

   .btn-danger.disabled {
     background-color: $white;
     color: $gray-50;
     line-height: 1.71;
     font-size: 1em;
   }

   a.cancel-link {
     color: $purple-300;
   }

   .reset-flag-count {
     margin: 16px -16px -16px -16px;
     height: 48px;
     color: $maroon-50;
     background-color: rgba(255, 182, 184, 0.25);
     border-bottom-left-radius: 8px;
     border-bottom-right-radius: 8px;
     justify-content: center;
     cursor: pointer;

     &:hover {
      text-decoration: underline;
     }
   }
</style>

<script>
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';
import { userStateMixin } from '../../mixins/userState';
import markdownDirective from '@/directives/markdown';
import svgClose from '@/assets/svg/close.svg';
import svgReport from '@/assets/svg/report.svg';

export default {
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
      abuseObject: '',
      groupId: '',
      reportComment: '',
      icons: Object.freeze({
        close: svgClose,
        report: svgReport,
      }),
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
      if (!this.reportComment) return;
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
