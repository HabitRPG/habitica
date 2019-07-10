<template lang="pug">
div
  .mentioned-icon(v-if='isUserMentioned')
  .message-hidden(v-if='!inbox && msg.flagCount === 1 && user.contributor.admin') Message flagged once, not hidden
  .message-hidden(v-if='!inbox && msg.flagCount > 1 && user.contributor.admin') Message hidden
  .card-body
    user-link(:userId="msg.uuid", :name="msg.user", :backer="msg.backer", :contributor="msg.contributor")
    p.time
      span.mr-1(v-if="msg.username") @{{ msg.username }}
      span.mr-1(v-if="msg.username") •
      span(v-b-tooltip="", :title="msg.timestamp | date") {{ msg.timestamp | timeAgo }}&nbsp;
      span(v-if="msg.client && user.contributor.level >= 4")  ({{ msg.client }})
    .text(v-html='atHighlight(parseMarkdown(msg.text))')
    .reported(v-if="isMessageReported && (inbox === true)")
      span(v-once) {{ $t('reportedMessage')}}
      br
      span(v-once) {{ $t('canDeleteNow') }}
    hr
    .d-flex(v-if='msg.id')
      .action.d-flex.align-items-center(v-if='!inbox', @click='copyAsTodo(msg)')
        .svg-icon(v-html="icons.copy")
        div {{$t('copyAsTodo')}}
      .action.d-flex.align-items-center(v-if='(inbox || (user.flags.communityGuidelinesAccepted && msg.uuid !== "system")) && (!isMessageReported || user.contributor.admin)', @click='report(msg)')
        .svg-icon(v-html="icons.report", v-once)
        div(v-once) {{$t('report')}}
      .action.d-flex.align-items-center(v-if='msg.uuid === user._id || inbox || user.contributor.admin', @click='remove()')
        .svg-icon(v-html="icons.delete", v-once)
        div(v-once) {{$t('delete')}}
      .ml-auto.d-flex(v-b-tooltip="{title: likeTooltip(msg.likes[user._id])}", v-if='!inbox')
        .action.d-flex.align-items-center.mr-0(@click='like()', v-if='likeCount > 0', :class='{active: msg.likes[user._id]}')
          .svg-icon(v-html="icons.liked", :title='$t("liked")')
          | +{{ likeCount }}
        .action.d-flex.align-items-center.mr-0(@click='like()', v-if='likeCount === 0', :class='{active: msg.likes[user._id]}')
          .svg-icon(v-html="icons.like", :title='$t("like")')
      span(v-if='!msg.likes[user._id] && !inbox') {{ $t('like') }}
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
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/tiers.scss';

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

  .active {
    color: $purple-300;

    .svg-icon {
      color: $purple-400;
    }
  }

  .reported {
    margin-top: 18px;
    color: $red-50;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import escapeRegExp from 'lodash/escapeRegExp';
import max from 'lodash/max';

import habiticaMarkdown from 'habitica-markdown';
import { mapState } from 'client/libs/store';
import userLink from '../userLink';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import {highlightUsers} from '../../libs/highlightUsers';

export default {
  components: {userLink},
  props: {
    msg: {},
    inbox: {
      type: Boolean,
      default: false,
    },
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
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
    date (value) {
      // @TODO: Vue doesn't support this so we cant user preference
      return moment(value).toDate();
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isUserMentioned () {
      const message = this.msg;
      const user = this.user;

      if (message.hasOwnProperty('highlight')) return message.highlight;

      message.highlight = false;
      const messageText = message.text.toLowerCase();
      const displayName = user.profile.name;
      const username = user.auth.local && user.auth.local.username;
      const mentioned = max([messageText.indexOf(username.toLowerCase()), messageText.indexOf(displayName.toLowerCase())]);
      if (mentioned === -1) return message.highlight;

      const escapedDisplayName = escapeRegExp(displayName);
      const escapedUsername = escapeRegExp(username);
      const pattern = `@(${escapedUsername}|${escapedDisplayName})(\\b)`;
      const precedingChar = messageText.substring(mentioned - 1, mentioned);
      if (mentioned === 0 || precedingChar.trim() === '' || precedingChar === '@') {
        let regex = new RegExp(pattern, 'i');
        message.highlight = regex.test(messageText);
      }

      return message.highlight;
    },
    likeCount () {
      const message = this.msg;
      if (!message.likes) return 0;

      let likeCount = 0;
      for (let key in message.likes) {
        let like = message.likes[key];
        if (like) likeCount += 1;
      }
      return likeCount;
    },
    isMessageReported () {
      return this.msg.flags && this.msg.flags[this.user.id] || this.reported;
    },
  },
  methods: {
    async like () {
      let message = cloneDeep(this.msg);

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
      if (!confirm(this.$t('areYouSureDeleteMessage'))) return;

      const message = this.msg;
      this.$emit('message-removed', message);

      if (this.inbox) {
        await axios.delete(`/api/v4/inbox/messages/${message.id}`);
        return;
      }

      await this.$store.dispatch('chat:deleteChat', {
        groupId: this.groupId,
        chatId: message.id,
      });
    },
    atHighlight (text) {
      return highlightUsers(text, this.user.auth.local.username, this.user.profile.name);
    },
    parseMarkdown (text) {
      if (!text) return;
      return habiticaMarkdown.render(String(text));
    },
  },
  mounted () {
    this.$emit('chat-card-mounted', this.msg.id);
  },
};
</script>
