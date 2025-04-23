<template>
  <div
    class="card"
    :class="{
      'system-message': isSystemMessage
    }"
  >
    <div
      v-b-tooltip.hover="messageDateForSystemMessage"
      class="message-card"

      :class="{
        'user-sent-message': userSentMessage,
        'user-received-message': !userSentMessage && !isSystemMessage,
        'system-message': isSystemMessage
      }"
    >
      <div
        v-if="isUserMentioned"
        class="mentioned-icon"
      ></div>
      <div
        v-if="userIsModerator && msg.flagCount"
        class="message-hidden"
      >
        {{ flagCountDescription }}
      </div>
      <div
        class="card-body"
      >
        <user-link
          v-if="!isSystemMessage"
          :user-id="msg.uuid"
          :name="msg.user"
          :backer="msg.backer"
          :contributor="msg.contributor"
        />
        <p
          v-if="!isSystemMessage"
          class="time"
        >
          <span
            v-if="msg.username"
            class="mr-1"
          >@{{ msg.username }}</span><span
            v-if="msg.username"
            class="mr-1"
          >•</span>
          <span v-b-tooltip.hover="messageDate">{{ msg.timestamp | timeAgo }}&nbsp;</span>
          <span v-if="msg.client && user.contributor.level >= 4">
            ({{ msg.client }})
          </span>
        </p>

        <b-dropdown
          v-if="!isSystemMessage"
          right="right"
          variant="flat"
          toggle-class="with-icon"
          class="card-menu no-min-width"
          :no-caret="true"
        >
          <template #button-content>
            <span
              v-once
              class="svg-icon inline menuIcon color"
              v-html="icons.menuIcon"
            >
            </span>
          </template>
          <b-dropdown-item
            class="selectListItem"
            @click="copy(msg)"
          >
            <span class="with-icon">
              <span
                v-once
                class="svg-icon icon-16 color"
                v-html="icons.copy"
              ></span>
              <span v-once>
                {{ $t('copy') }}
              </span>
            </span>
          </b-dropdown-item>
          <b-dropdown-item
            v-if="canReportMessage"
            class="selectListItem custom-hover--red"
            @click="report(msg)"
          >
            <span class="with-icon">
              <span
                v-once
                class="svg-icon icon-16 color"
                v-html="icons.report"
              ></span>
              <span v-once>
                {{ $t('report') }}
              </span>
            </span>
          </b-dropdown-item>
          <b-dropdown-item
            v-if="canDeleteMessage"
            class="selectListItem custom-hover--red"
            @click="remove()"
          >
            <span class="with-icon">
              <span
                v-once
                class="svg-icon icon-16 color"
                v-html="icons.delete"
              ></span>
              <span v-once>
                {{ $t('delete') }}
              </span>
            </span>
          </b-dropdown-item>
        </b-dropdown>

        <div
          v-if="isSystemMessage"
          class="system-message-body"
        >
          {{ msg.unformattedText }}
        </div>
        <div
          v-else
          ref="markdownContainer"
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

        <like-button
          v-if="canLikeMessage"
          class="mt-75"
          :liked-by-current-user="msg.likes[user._id]"
          :like-count="likeCount"
          @toggle-like="like()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.message-card {
  .at-highlight {
    background-color: rgba(213, 200, 255, 0.32);
    padding: 0.1rem;
  }

  .at-text {
    color: #6133b4;
  }

  .card-menu button {
    justify-content: center;
    margin: 0;
    padding: 0;
    height: 1rem;
    width: 1rem;
  }

  .markdown p:last-of-type {
    margin-bottom: 0;
  }
}

</style>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/tiers.scss';

.card {
  background: transparent !important;
  margin-bottom: 0 !important;
}

.message-card:not(.system-message) {
  background: white;
}

.mentioned-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: $purple-500;
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

.active {
  color: $purple-300;

  .svg-icon {
    color: $purple-400;
  }
}

.message-card {
  border-radius: 7px;
  margin: 0;
  padding: 1rem 0.75rem 0.5rem 1rem;

  &.system-message {
    padding-top: 0.5rem;
  }

  .card-body {
    position: relative;
    padding: 0;

    .time {
      font-size: 12px;
      color: $gray-100;
      margin-bottom: 0.5rem;
    }

    .text {
      font-size: 14px;
      color: $gray-50;
      text-align: initial;
      min-height: 0rem;
    }
  }
}

.card-menu {
  position: absolute;
  top: 0;
  right: 0;

  &:not(.show) {
    display: none;
  }
}

.card-body:hover {
  .card-menu {
    display: block;
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

.selectListItem:not(:hover) .svg-icon.icon-16.color {
  color: #{$gray-100}
}

.custom-hover--red {
  --hover-color: #{$maroon-50};
  --hover-background: #{rgba($red-500, 0.25)};
}

.user-sent-message {
  border: 1px solid $purple-400;
}

.system-message {
  border: 1px solid $purple-400;
}

.user-received-message {
  border: 1px solid $gray-500;
}

.card-menu {
  // icon-color is the menu icon itself
  --icon-color: #{$gray-100};

  --dropdown-item-hover-icon-color: #{$gray-100};

  &:hover {
    --icon-color: #{$purple-300};
  }
}

.menuIcon {
  width: 4px;
  height: 1rem;
  object-fit: contain;
}

.system-message-body {
  line-height: 1.71;
  text-align: center;
  color: $purple-300;
}

</style>

<script>
import axios from 'axios';
import moment from 'moment';

import cloneDeep from 'lodash/cloneDeep';
import escapeRegExp from 'lodash/escapeRegExp';
import { CHAT_FLAG_FROM_SHADOW_MUTE, CHAT_FLAG_LIMIT_FOR_HIDING } from '@/../../common/script/constants';
import externalLinks from '../../mixins/externalLinks';

import { CopyToClipboardMixin } from '@/mixins/copyToClipboard';

import renderWithMentions from '@/libs/renderWithMentions';
import { mapState } from '@/libs/store';
import userLink from '../userLink';

import deleteIcon from '@/assets/svg/delete.svg';
import reportIcon from '@/assets/svg/report.svg';
import menuIcon from '@/assets/svg/menu.svg';
import { userStateMixin } from '@/mixins/userState';
import copyIcon from '@/assets/svg/copy.svg';
import LikeButton from '@/components/messages/likeButton.vue';

const LikeLogicMixin = {
  computed: {
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
  },
  methods: {

    async like () {
      const message = cloneDeep(this.msg);

      await this.$store.dispatch('chat:like', {
        groupId: this.groupId,
        chatMessageId: this.privateMessageMode ? message.uniqueMessageId : message.id,
      });

      message.likes[this.user._id] = !message.likes[this.user._id];

      this.$emit('message-liked', message);
      this.$root.$emit('bv::hide::tooltip');
    },
  },
};

export default {
  components: {
    LikeButton,
    userLink,
  },
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
    date (value) {
      // @TODO: Vue doesn't support this so we cant user preference
      return moment(value).toDate().toString();
    },
  },
  mixins: [
    externalLinks, userStateMixin, LikeLogicMixin,
    CopyToClipboardMixin,
  ],
  props: {
    msg: {
      type: Object,
    },
    groupId: {
      type: String,
    },
    privateMessageMode: {
      type: Boolean,
    },
    userSentMessage: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        delete: deleteIcon,
        report: reportIcon,
        copy: copyIcon,
        menuIcon,
      }),
      reported: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    isMessageReported () {
      return (this.msg.flags && this.msg.flags[this.user.id]) || this.reported;
    },
    messageDateForSystemMessage () {
      return this.isSystemMessage ? this.messageDate : '';
    },
    messageDate () {
      const date = moment(this.msg.timestamp).toDate();
      return date.toString();
    },
    userIsModerator () {
      return this.hasPermission(this.user, 'moderator');
    },
    isSystemMessage () {
      return this.msg.uuid === 'system';
    },
    canLikeMessage () {
      if (this.isSystemMessage) {
        return false;
      }

      if (this.privateMessageMode) {
        return Boolean(this.msg.uniqueMessageId);
      }

      return this.msg.id;
    },
    canDeleteMessage () {
      return this.privateMessageMode
        || this.msg.uuid === this.user._id
        || this.userIsModerator;
    },
    canReportMessage () {
      if (this.privateMessageMode) {
        return !this.isMessageReported;
      }
      return (this.user.flags.communityGuidelinesAccepted && this.msg.uuid !== 'system')
        && (!this.isMessageReported || this.userIsModerator);
    },
    isUserMentioned () {
      const message = this.msg;

      if (message.highlight) {
        return true;
      }

      const { user } = this;
      const displayName = user.profile.name;
      const { username } = user.auth.local;
      const pattern = `@(${escapeRegExp(displayName)}|${escapeRegExp(username)})(\\b)`;
      message.highlight = new RegExp(pattern, 'i').test(message.text);

      return message.highlight;
    },
    flagCountDescription () {
      if (!this.msg.flagCount) {
        return '';
      }

      if (this.msg.flagCount < CHAT_FLAG_LIMIT_FOR_HIDING) {
        return 'Message flagged once, not hidden';
      }

      if (this.msg.flagCount < CHAT_FLAG_FROM_SHADOW_MUTE) {
        return 'Message hidden';
      }

      return 'Message hidden (shadow-muted)';
    },
  },
  mounted () {
    this.$emit('message-card-mounted');
    this.handleExternalLinks();
    this.mapProfileLinksToModal();
  },
  updated () {
    this.handleExternalLinks();
    this.mapProfileLinksToModal();
  },
  methods: {
    mapProfileLinksToModal () {
      const links = this.$refs.markdownContainer.getElementsByTagName('a');
      for (let i = 0; i < links.length; i += 1) {
        let link = links[i].pathname;

        // Internet Explorer does not provide the leading slash character in the pathname
        link = link.charAt(0) === '/' ? link : `/${link}`;

        if (link.startsWith('/profile/')) {
          links[i].onclick = ev => {
            ev.preventDefault();
            this.$router.push({ path: link });
          };
        }
      }
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
        groupId: this.groupId,
      });
    },
    async remove () {
      // eslint-disable-next-line no-alert
      if (!window.confirm(this.$t('areYouSureDeleteMessage'))) {
        return;
      }

      const message = this.msg;
      this.$emit('message-removed', message);

      if (this.privateMessageMode) {
        await axios.delete(`/api/v4/inbox/messages/${message.id}`);
      } else {
        await this.$store.dispatch('chat:deleteChat', {
          groupId: this.groupId,
          chatId: message.id,
        });
      }
    },
    copy (message) {
      this.mixinCopyToClipboard(message.text, this.$t('messageCopiedToClipboard'));
    },
    parseMarkdown (text) {
      return renderWithMentions(text, this.user);
    },
  },
};
</script>
