<template>
  <div class="card-body">
    <user-link
      :user-id="msg.uuid"
      :name="msg.user"
      :backer="msg.backer"
      :contributor="msg.contributor"
    />
    <p class="time">
      <span
        v-if="msg.username"
        class="mr-1"
      >@{{ msg.username }}</span><span
        v-if="msg.username"
        class="mr-1"
      >•</span>
      <span
        v-b-tooltip.hover="messageDate"
      >{{ msg.timestamp | timeAgo }}&nbsp;</span>
      <span v-if="msg.client && user.contributor.level >= 4"> ({{ msg.client }})</span>
    </p>
    <div
      class="text markdown"
      dir="auto"
      v-html="parseMarkdown(msg.text)"
    ></div>
    <div
      v-if="isMessageReported"
      class="reported"
    >
      <span v-once>{{ $t('reportedMessage') }}</span><br>
      <span v-once>{{ $t('canDeleteNow') }}</span>
    </div>
    <hr>
    <div
      v-if="msg.id"
      class="d-flex"
    >
      <div
        v-if="!isMessageReported"
        class="action d-flex align-items-center"
        @click="report(msg)"
      >
        <div
          v-once
          class="svg-icon"
          v-html="icons.report"
        ></div>
        <div v-once>
          {{ $t('report') }}
        </div>
      </div>
      <div
        class="action d-flex align-items-center"
        @click="remove()"
      >
        <div
          v-once
          class="svg-icon"
          v-html="icons.delete"
        ></div>
        <div v-once>
          {{ $t('delete') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .at-highlight {
    background-color: rgba(213, 200, 255, 0.32);
    padding: 0.1rem;
  }

  .at-text {
    color: #6133b4;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/tiers.scss';

  .action {
    display: inline-block;
    color: $gray-200;
    margin-right: 1em;
    font-size: 12px;

    :hover {
      cursor: pointer;
    }

    .svg-icon {
      color: $gray-300;
      margin-right: .2em;
      width: 16px;
    }
  }

  .active {
    color: $purple-300;

    .svg-icon {
      color: $purple-400;
    }
  }

  .card-body {
    padding: 0.75rem 1.25rem 0.75rem 1.25rem;

    .time {
      font-size: 12px;
      color: $gray-200;
      margin-bottom: 0.5rem;
    }

    .text {
      font-size: 14px;
      color: $gray-50;
      text-align: initial;
      min-height: 0rem;
    }
  }

  hr {
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
  }

  .reported {
    margin-top: 18px;
    color: $red-50;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';

import externalLinks from '../../mixins/externalLinks';

import renderWithMentions from '@/libs/renderWithMentions';
import { mapState } from '@/libs/store';
import userLink from '../userLink';

import deleteIcon from '@/assets/svg/delete.svg';
import reportIcon from '@/assets/svg/report.svg';

export default {
  components: {
    userLink,
  },
  mixins: [externalLinks],
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
  },
  props: {
    msg: {},
  },
  data () {
    return {
      icons: Object.freeze({
        delete: deleteIcon,
        report: reportIcon,
      }),
      reported: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    isMessageReported () {
      return (this.msg.flags && this.msg.flags[this.user.id]) || this.reported;
    },
    messageDate () {
      const date = moment(this.msg.timestamp).toDate();
      return date.toString();
    },
  },
  mounted () {
    this.$emit('message-card-mounted');
    this.handleExternalLinks();
  },
  updated () {
    this.handleExternalLinks();
  },
  methods: {
    report () {
      this.$root.$on('habitica:report-result', data => {
        if (data.ok) {
          this.reported = true;
        }

        this.$root.$off('habitica:report-result');
      });

      this.$root.$emit('habitica::report-chat', {
        message: this.msg,
        groupId: 'privateMessage',
      });
    },
    async remove () {
      if (!window.confirm(this.$t('areYouSureDeleteMessage'))) return; // eslint-disable-line no-alert

      const message = this.msg;
      this.$emit('message-removed', message);

      await axios.delete(`/api/v4/inbox/messages/${message.id}`);
    },
    parseMarkdown (text) {
      return renderWithMentions(text, this.user);
    },
  },
};
</script>
