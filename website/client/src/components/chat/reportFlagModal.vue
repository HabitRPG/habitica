<template>
  <b-modal
    id="report-flag"
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
          v-html="abuseObject.text"
        >
        </div>
      </blockquote>
      <div>
        <strong>{{ $t('whyReportingPost') }}</strong>
        <textarea
          v-model="reportComment"
          class="form-control"
          :placeholder="$t('whyReportingPostPlaceholder')"
        ></textarea>
      </div>
      <p
        class="report-guidelines"
        v-html="$t('abuseFlagModalBody', abuseFlagModalBody)"
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
      v-if="user.contributor.admin"
      class="reset-flag-count d-flex"
      @click="clearFlagCount()"
    >
      <span
        class="my-auto"
        @click="clearFlagCount()"
      >
        {{ $t('resetFlags') }}
      </span>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #report-flag {
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

  span.svg-icon.icon-16 {
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
     color: $gray-10;
     background-color: $gray-700;
     border-radius: 4px;
     height: max-content;
     margin-top: 24px;
     padding: 8px 16px 8px 16px;
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
    width: 75px
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
import notifications from '@/mixins/notifications';
import markdownDirective from '@/directives/markdown';
import { userStateMixin } from '../../mixins/userState';
import svgClose from '@/assets/svg/close.svg';

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
      }),
    };
  },
  mounted () {
    this.$root.$on('habitica::report-chat', this.handleReport);
  },
  beforeDestroy () {
    this.$root.$off('habitica::report-chat', this.handleReport);
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-flag');
    },
    async reportAbuse () {
      if (!this.reportComment) return;
      this.text(this.$t(this.groupId === 'privateMessage' ? 'pmReported' : 'abuseReported'));

      const result = await this.$store.dispatch('chat:flag', {
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
