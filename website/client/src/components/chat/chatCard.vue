<template>
  <div>
    <div
      v-if="isUserMentioned"
      class="mentioned-icon"
    ></div>
    <div
      v-if="user.contributor.admin && msg.flagCount"
      class="message-hidden"
    >
      {{ flagCountDescription }}
    </div>
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
        >@{{ msg.username }}</span>
        <span
          v-if="msg.username"
          class="mr-1"
        >•</span>
        <span
          v-b-tooltip.hover="messageDate"
        >{{ msg.timestamp | timeAgo }}&nbsp;</span>
        <span v-if="msg.client && user.contributor.level >= 4">({{ msg.client }})</span>
      </p>
      <div
        ref="markdownContainer"
        class="text"
        v-html="atHighlight(parseMarkdown(msg.text))"
      ></div>
      <hr>
      <div
        v-if="msg.id"
        class="d-flex"
      >
        <div
          class="action d-flex align-items-center"
          @click="copyAsTodo(msg)"
        >
          <div
            class="svg-icon"
            v-html="icons.copy"
          ></div>
          <div>{{ $t('copyAsTodo') }}</div>
        </div>
        <div
          v-if="(user.flags.communityGuidelinesAccepted && msg.uuid !== 'system')
            && (!isMessageReported || user.contributor.admin)"
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
          v-if="msg.uuid === user._id || user.contributor.admin"
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
        <div
          v-b-tooltip="{title: likeTooltip(msg.likes[user._id])}"
          class="ml-auto d-flex"
        >
          <div
            v-if="likeCount > 0"
            class="action d-flex align-items-center mr-0"
            :class="{activeLike: msg.likes[user._id]}"
            @click="like()"
          >
            <div
              class="svg-icon"
              :title="$t('liked')"
              v-html="icons.liked"
            ></div>
            +{{ likeCount }}
          </div>
          <div
            v-if="likeCount === 0"
            class="action d-flex align-items-center mr-0"
            :class="{activeLike: msg.likes[user._id]}"
            @click="like()"
          >
            <div
              class="svg-icon"
              :title="$t('like')"
              v-html="icons.like"
            ></div>
          </div>
        </div>
        <span v-if="!msg.likes[user._id]">{{ $t('like') }}</span>
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

  .mentioned-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #bda8ff;
    box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
    position: absolute;
    right: -.5em;
    top: -.5em;
  }

  .message-hidden {
    margin-left: 1.5em;
    margin-top: 1em;
    color: red;
  }

  hr {
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
  }

  .card-body {
    padding: 0.75rem 1.25rem 0.75rem 1.25rem;

    .time {
      font-size: 12px;
      color: #878190;
      margin-bottom: 0.5rem;
    }

    .text {
      font-size: 14px;
      color: #4e4a57;
      text-align: left !important;
      min-height: 0rem;
      margin-bottom: -0.5rem;
    }
  }

  .action {
    display: inline-block;
    color: #878190;
    margin-right: 1em;
    font-size: 12px;

    :hover {
      cursor: pointer;
    }

    .svg-icon {
      color: #A5A1AC;
      margin-right: .2em;
      width: 16px;
    }
  }

  .activeLike {
    color: $purple-300;

    .svg-icon {
      color: $purple-400;
    }
  }
</style>

<script>
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import escapeRegExp from 'lodash/escapeRegExp';
import max from 'lodash/max';

import habiticaMarkdown from 'habitica-markdown';
import { mapState } from '@/libs/store';
import userLink from '../userLink';

import deleteIcon from '@/assets/svg/delete.svg';
import copyIcon from '@/assets/svg/copy.svg';
import likeIcon from '@/assets/svg/like.svg';
import likedIcon from '@/assets/svg/liked.svg';
import reportIcon from '@/assets/svg/report.svg';
import { highlightUsers } from '../../libs/highlightUsers';
import { CHAT_FLAG_LIMIT_FOR_HIDING, CHAT_FLAG_FROM_SHADOW_MUTE } from '@/../../common/script/constants';

export default {
  components: { userLink },
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
    date (value) {
      // @TODO: Vue doesn't support this so we cant user preference
      return moment(value).toDate().toString();
    },
  },
  props: {
    msg: {},
    groupId: {},
  },
  data () {
    return {
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        liked: likedIcon,
      }),
      reported: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    isUserMentioned () {
      const message = this.msg;
      const { user } = this;

      if (message.highlight) return message.highlight;

      message.highlight = false;
      const messageText = message.text.toLowerCase();
      const displayName = user.profile.name;
      const username = user.auth.local && user.auth.local.username;
      const mentioned = max([
        messageText.indexOf(username.toLowerCase()),
        messageText.indexOf(displayName.toLowerCase()),
      ]);
      if (mentioned === -1) return message.highlight;

      const escapedDisplayName = escapeRegExp(displayName);
      const escapedUsername = escapeRegExp(username);
      const pattern = `@(${escapedUsername}|${escapedDisplayName})(\\b)`;
      const precedingChar = messageText.substring(mentioned - 1, mentioned);
      if (mentioned === 0 || precedingChar.trim() === '' || precedingChar === '@') {
        const regex = new RegExp(pattern, 'i');
        message.highlight = regex.test(messageText);
      }

      return message.highlight;
    },
    likeCount () {
      const message = this.msg;
      if (!message.likes) return 0;

      let likeCount = 0;
      for (const key of Object.keys(message.likes)) {
        const like = message.likes[key];
        if (like) likeCount += 1;
      }
      return likeCount;
    },
    isMessageReported () {
      return (this.msg.flags && this.msg.flags[this.user.id]) || this.reported;
    },
    flagCountDescription () {
      if (!this.msg.flagCount) return '';
      if (this.msg.flagCount < CHAT_FLAG_LIMIT_FOR_HIDING) return 'Message flagged once, not hidden';
      if (this.msg.flagCount < CHAT_FLAG_FROM_SHADOW_MUTE) return 'Message hidden';
      return 'Message hidden (shadow-muted)';
    },
    messageDate () {
      const date = moment(this.msg.timestamp).toDate();
      return date.toString();
    },
  },
  mounted () {
    const links = this.$refs.markdownContainer.getElementsByTagName('a');
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      if (links[i].getAttribute('href').startsWith('/profile/')) {
        links[i].onclick = ev => {
          ev.preventDefault();
          this.$router.push({ path: link.getAttribute('href') });
        };
      }
    }
    this.CHAT_FLAG_LIMIT_FOR_HIDING = CHAT_FLAG_LIMIT_FOR_HIDING;
    this.CHAT_FLAG_FROM_SHADOW_MUTE = CHAT_FLAG_FROM_SHADOW_MUTE;
    this.$emit('chat-card-mounted', this.msg.id);
  },
  methods: {
    async like () {
      const message = cloneDeep(this.msg);

      await this.$store.dispatch('chat:like', {
        groupId: this.groupId,
        chatId: message.id,
      });

      if (!message.likes[this.user._id]) {
        message.likes[this.user._id] = true;
      } else {
        message.likes[this.user._id] = !message.likes[this.user._id];
      }

      this.$emit('message-liked', message);
      this.$root.$emit('bv::hide::tooltip');
    },
    likeTooltip (likedStatus) {
      if (!likedStatus) return this.$t('like');
      return null;
    },
    copyAsTodo (message) {
      this.$root.$emit('habitica::copy-as-todo', message);
    },
    report () {
      this.$root.$on('habitica:report-result', data => {
        if (data.ok) {
          this.reported = true;
        }

        this.$root.$off('habitica:report-result');
      });

      this.$root.$emit('habitica::report-chat', {
        message: this.msg,
        groupId: this.groupId || 'privateMessage',
      });
    },
    async remove () {
      if (!window.confirm(this.$t('areYouSureDeleteMessage'))) return;

      const message = this.msg;
      this.$emit('message-removed', message);

      await this.$store.dispatch('chat:deleteChat', {
        groupId: this.groupId,
        chatId: message.id,
      });
    },
    atHighlight (text) {
      return highlightUsers(text, this.user.auth.local.username, this.user.profile.name);
    },
    parseMarkdown (text) {
      if (!text) return null;
      return habiticaMarkdown.render(String(text));
    },
  },
};
</script>
