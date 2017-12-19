<template lang="pug">
div
  .mentioned-icon(v-if='isUserMentioned')
  .message-hidden(v-if='msg.flagCount === 1 && user.contributor.admin') Message flagged once, not hidden
  .message-hidden(v-if='msg.flagCount > 1 && user.contributor.admin') Message hidden
  .card-body
      h3.leader(
        :class='userLevelStyle(msg)',
        @click="showMemberModal(msg.uuid)",
        v-b-tooltip.hover.top="('contributor' in msg) ? msg.contributor.text : ''",
      )
        | {{msg.user}}
        .svg-icon(v-html="tierIcon", v-if='showShowTierStyle')
      p.time {{msg.timestamp | timeAgo}}
      .text(v-markdown='msg.text')
      hr
      .action(@click='like()', v-if='msg.likes', :class='{active: msg.likes[user._id]}')
        .svg-icon(v-html="icons.like")
        span(v-if='!msg.likes[user._id]') {{ $t('like') }}
        span(v-if='msg.likes[user._id]') {{ $t('liked') }}
      // @TODO make copyAsTodo work in Tavern, guilds, party (inbox can be done later)
        span.action(v-if='!inbox', @click='copyAsTodo(msg)')
          .svg-icon(v-html="icons.copy")
          | {{$t('copyAsTodo')}}
          // @TODO make copyAsTodo work in the inbox
      span.action(v-if='!inbox && user.flags.communityGuidelinesAccepted && msg.uuid !== "system"', @click='report(msg)')
        .svg-icon(v-html="icons.report")
        | {{$t('report')}}
        // @TODO make flagging/reporting work in the inbox. NOTE: it must work even if the communityGuidelines are not accepted and it MUST work for messages that you have SENT as well as received. -- Alys
      span.action(v-if='msg.uuid === user._id || inbox || user.contributor.admin', @click='remove()')
        .svg-icon(v-html="icons.delete")
        | {{$t('delete')}}
      span.action.float-right.liked(v-if='likeCount > 0')
        .svg-icon(v-html="icons.liked")
        | + {{ likeCount }}
</template>

<style lang="scss" scoped>
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

  .card-body {
    .leader {
      margin-bottom: 0;
    }

    h3 { // this is the user name
      cursor: pointer;
      display: inline-block;

      .svg-icon {
        width: 10px;
        display: inline-block;
        margin-left: .5em;
      }
    }

    .time {
      font-size: 12px;
      color: #878190;
    }

    .text {
      font-size: 14px;
      color: #4e4a57;
      text-align: left !important;
    }
  }

  .action {
    display: inline-block;
    color: #878190;
    margin-right: 1em;
  }

  .action:hover {
    cursor: pointer;
  }

  .liked:hover {
    cursor: default;
  }

  .action .svg-icon {
    margin-right: .2em;
    width: 16px;
    display: inline-block;
    color: #A5A1AC;
  }

  .action.active, .active .svg-icon {
    color: #46a7d9
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import escapeRegExp from 'lodash/escapeRegExp';

import markdownDirective from 'client/directives/markdown';
import { mapState } from 'client/libs/store';
import styleHelper from 'client/mixins/styleHelper';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import tier1 from 'assets/svg/tier-1.svg';
import tier2 from 'assets/svg/tier-2.svg';
import tier3 from 'assets/svg/tier-3.svg';
import tier4 from 'assets/svg/tier-4.svg';
import tier5 from 'assets/svg/tier-5.svg';
import tier6 from 'assets/svg/tier-6.svg';
import tier7 from 'assets/svg/tier-7.svg';
import tier8 from 'assets/svg/tier-mod.svg';
import tier9 from 'assets/svg/tier-staff.svg';
import tierNPC from 'assets/svg/tier-npc.svg';

export default {
  props: ['msg', 'inbox', 'groupId'],
  mixins: [styleHelper],
  data () {
    return {
      copyingMessage: {},
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        liked: likedIcon,
        tier1,
        tier2,
        tier3,
        tier4,
        tier5,
        tier6,
        tier7,
        tier8,
        tier9,
        tierNPC,
      }),
    };
  },
  directives: {
    markdown: markdownDirective,
  },
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
    date (value) {
      // @TODO: Add user preference
      return moment(value).toDate();
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isUserMentioned () {
      const message = this.msg;
      let user = this.user;

      if (message.hasOwnProperty('highlight')) return message.highlight;

      message.highlight = false;
      let messagetext = message.text.toLowerCase();
      let username = user.profile.name;
      let mentioned = messagetext.indexOf(username.toLowerCase());
      let escapedUsername = escapeRegExp(username);
      let pattern = `@${escapedUsername}([^\w]|$){1}`;

      if (mentioned === -1) return message.highlight;

      let preceedingchar = messagetext.substring(mentioned - 1, mentioned);
      if (mentioned === 0 || preceedingchar.trim() === '' || preceedingchar === '@') {
        let regex = new RegExp(pattern, 'i');
        message.highlight = regex.test(messagetext);
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
    showShowTierStyle () {
      const message = this.msg;
      const isContributor = Boolean(message.contributor && message.contributor.level);
      const isNPC = Boolean(message.backer && message.backer.npc);
      return isContributor || isNPC;
    },
    tierIcon () {
      const message = this.msg;
      const isNPC = Boolean(message.backer && message.backer.npc);
      if (isNPC) {
        return this.icons.tierNPC;
      }
      return this.icons[`tier${message.contributor.level}`];
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

      this.$emit('messaged-liked', message);
    },
    copyAsTodo (message) {
      // @TODO: Move to Habitica Event
      this.copyingMessage = message;
      this.$root.$emit('bv::show::modal', 'copyAsTodo');
    },
    async report () {
      this.$root.$emit('habitica::report-chat', {
        message: this.msg,
        groupId: this.groupId,
      });
    },
    async remove () {
      if (!confirm(this.$t('areYouSureDeleteMessage'))) return;

      const message = this.msg;
      this.$emit('message-removed', message);

      if (this.inbox) {
        axios.delete(`/api/v3/user/messages/${message.id}`);
        this.$delete(this.user.inbox.messages, message.id);
        return;
      }

      await this.$store.dispatch('chat:deleteChat', {
        groupId: this.groupId,
        chatId: message.id,
      });
    },
    showMemberModal (memberId) {
      this.$emit('show-member-modal', memberId);
    },
  },
};
</script>
