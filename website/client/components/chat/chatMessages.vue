<template lang="pug">
.container
  .row
    .col-12
      copy-as-todo-modal(:copying-message='copyingMessage', :group-name='groupName', :group-id='groupId')
      report-flag-modal

  div(v-for="(msg, index) in messages", v-if='chat && canViewFlag(msg)')
    // @TODO: is there a different way to do these conditionals? This creates an infinite loop
    //.hr(v-if='displayDivider(msg)')
      .hr-middle(v-once) {{ msg.timestamp }}
    .row(v-if='user._id !== msg.uuid')
      div(:class='inbox ? "col-4" : "col-2"')
        avatar(
          v-if='cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected',
          :member="cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :hideClassBadge='true',
          @click.native="showMemberModal(msg.uuid)",
        )
      .card(:class='inbox ? "col-8" : "col-10"')
        .mentioned-icon(v-if='isUserMentioned(msg)')
        .message-hidden(v-if='msg.flagCount === 1 && user.contributor.admin') Message flagged once, not hidden
        .message-hidden(v-if='msg.flagCount > 1 && user.contributor.admin') Message hidden
        .card-body
            h3.leader(
              :class='userLevelStyle(cachedProfileData[msg.uuid])'
              @click="showMemberModal(msg.uuid)",
            )
              | {{msg.user}}
              .svg-icon(v-html="icons[`tier${cachedProfileData[msg.uuid].contributor.level}`]", v-if='cachedProfileData[msg.uuid] && cachedProfileData[msg.uuid].contributor && cachedProfileData[msg.uuid].contributor.level')
            p.time {{msg.timestamp | timeAgo}}
            .text(v-markdown='msg.text')
            hr
            .action(@click='like(msg, index)', v-if='msg.likes', :class='{active: msg.likes[user._id]}')
              .svg-icon(v-html="icons.like")
              span(v-if='!msg.likes[user._id]') {{ $t('like') }}
              span(v-if='msg.likes[user._id]') {{ $t('liked') }}
            // @TODO make copyAsTodo work in Tavern, guilds, party (inbox can be done later)
              span.action(v-if='!inbox', @click='copyAsTodo(msg)')
                .svg-icon(v-html="icons.copy")
                | {{$t('copyAsTodo')}}
                // @TODO make copyAsTodo work in the inbox
            span.action(v-if='!inbox && user.flags.communityGuidelinesAccepted', @click='report(msg)')
              .svg-icon(v-html="icons.report")
              | {{$t('report')}}
              // @TODO make flagging/reporting work in the inbox. NOTE: it must work even if the communityGuidelines are not accepted and it MUST work for messages that you have SENT as well as received. -- Alys
            span.action(v-if='msg.uuid === user._id || inbox || user.contributor.admin', @click='remove(msg, index)')
              .svg-icon(v-html="icons.delete")
              | {{$t('delete')}}
            span.action.float-right.liked(v-if='likeCount(msg) > 0')
              .svg-icon(v-html="icons.liked")
              | + {{ likeCount(msg) }}
    // @TODO can we avoid duplicating all this code? Cannot we just push everything
    // to the right if the user is the author?
    // Maybe we just create two sub components instead
    .row(v-if='user._id === msg.uuid')
      .card(:class='inbox ? "col-8" : "col-10"')
        .mentioned-icon(v-if='isUserMentioned(msg)')
        .message-hidden(v-if='msg.flagCount === 1 && user.contributor.admin') Message flagged once, not hidden
        .message-hidden(v-if='msg.flagCount > 1 && user.contributor.admin') Message hidden
        .card-body
            h3.leader(
              :class='userLevelStyle(cachedProfileData[msg.uuid])',
              @click="showMemberModal(msg.uuid)",
            )
              | {{msg.user}}
              .svg-icon(v-html="icons[`tier${cachedProfileData[msg.uuid].contributor.level}`]", v-if='cachedProfileData[msg.uuid] && cachedProfileData[msg.uuid].contributor && cachedProfileData[msg.uuid].contributor.level')
            p.time {{msg.timestamp | timeAgo}}
            .text(v-markdown='msg.text')
            hr
            .action(@click='like(msg, index)', v-if='msg.likes', :class='{active: msg.likes[user._id]}')
              .svg-icon(v-html="icons.like")
              span(v-if='!msg.likes[user._id]') {{ $t('like') }}
              span(v-if='msg.likes[user._id]') {{ $t('liked') }}
            // @TODO make copyAsTodo work in Tavern, guilds, party (inbox can be done later)
              span.action(v-if='!inbox', @click='copyAsTodo(msg)')
                .svg-icon(v-html="icons.copy")
                | {{$t('copyAsTodo')}}
                // @TODO make copyAsTodo work in the inbox
            span.action(v-if='user.flags.communityGuidelinesAccepted', @click='report(msg)')
            span.action(v-if='!inbox && user.flags.communityGuidelinesAccepted', @click='report(msg)')
              .svg-icon(v-html="icons.report")
              | {{$t('report')}}
              // @TODO make flagging/reporting work in the inbox. NOTE: it must work even if the communityGuidelines are not accepted and it MUST work for messages that you have SENT as well as received. -- Alys
            span.action(v-if='msg.uuid === user._id', @click='remove(msg, index)')
              .svg-icon(v-html="icons.delete")
              | {{$t('delete')}}
            span.action.float-right.liked(v-if='likeCount(msg) > 0')
              .svg-icon(v-html="icons.liked")
              | + {{ likeCount(msg) }}
      div(:class='inbox ? "col-4" : "col-2"')
        avatar(
          v-if='cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected',
          :member="cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :hideClassBadge='true',
          @click.native="showMemberModal(msg.uuid)",
        )
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  // @TODO: Move this to an scss
  .tier1 {
    color: #c42870;
  }

  .tier2 {
    color: #b01515;
  }

  .tier3 {
    color: #d70e14;
  }

  .tier4 {
    color: #c24d00;
  }

  .tier5 {
    color: #9e650f;
  }

  .tier6 {
    color: #2b8363;
  }

  .tier7 {
    color: #167e87;
  }

  .tier8 {
    color: #277eab;
  }

  .tier9 {
    color: #6133b4;
  }

  .tier10 {
    color: #77f4c7;
    fill: #77f4c7;
    stroke: #005737;
  }
  // End of tier colors

  .leader {
    margin-bottom: 0;
  }

  .time {
    font-size: 12px;
    color: #878190;
  }

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

  h3 { // this is the user name
    cursor: pointer;

    .svg-icon {
      width: 10px;
      display: inline-block;
      margin-left: .5em;
    }
  }

  .hr {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid $gray-500;
    text-align: center;
    margin: 2em 0;
  }

  .hr-middle {
    font-size: 16px;
    font-weight: bold;
    font-family: 'Roboto Condensed';
    line-height: 1.5;
    text-align: center;
    color: $gray-200;
    background-color: $gray-700;
    padding: .2em;
    margin-top: .2em;
    display: inline-block;
    width: 100px;
  }

  .card {
    margin-bottom: .5em;
  }

  .text {
    font-size: 14px;
    color: #4e4a57;
    text-align: left !important;
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

  .message-hidden {
    margin-left: 1.5em;
    margin-top: 1em;
    color: red;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import { mapState } from 'client/libs/store';
import debounce from 'lodash/debounce';
import escapeRegExp from 'lodash/escapeRegExp';
import markdownDirective from 'client/directives/markdown';
import Avatar from '../avatar';
import styleHelper from 'client/mixins/styleHelper';

import copyAsTodoModal from './copyAsTodoModal';
import reportFlagModal from './reportFlagModal';

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
import tier10 from 'assets/svg/tier-npc.svg';

export default {
  props: ['chat', 'groupId', 'groupName', 'inbox'],
  mixins: [styleHelper],
  components: {
    copyAsTodoModal,
    reportFlagModal,
    Avatar,
  },
  directives: {
    markdown: markdownDirective,
  },
  mounted () {
    this.loadProfileCache();
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  data () {
    return {
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
        tier10,
      }),
      copyingMessage: {},
      currentDayDividerDisplay: moment().day(),
      cachedProfileData: {},
      currentProfileLoadedCount: 0,
      currentProfileLoadedEnd: 10,
      loading: false,
    };
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
    // @TODO: We need a different lazy load mechnism.
    // But honestly, adding a paging route to chat would solve this
    messages () {
      return this.chat;
    },
  },
  watch: {
    messages (oldValue, newValue) {
      if (newValue.length === oldValue.length) return;
      this.loadProfileCache();
    },
  },
  methods: {
    handleScroll () {
      this.loadProfileCache(window.scrollY / 1000);
    },
    isUserMentioned (message) {
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
    canViewFlag (message) {
      if (message.uuid === this.user._id) return true;
      if (!message.flagCount || message.flagCount < 2) return true;
      return this.user.contributor.admin;
    },
    loadProfileCache: debounce(function loadProfileCache (screenPosition) {
      this._loadProfileCache(screenPosition);
    }, 1000),
    async _loadProfileCache (screenPosition) {
      let promises = [];

      // @TODO: write an explination
      if (screenPosition && Math.floor(screenPosition) + 1 > this.currentProfileLoadedEnd / 10) {
        this.currentProfileLoadedEnd = 10 * (Math.floor(screenPosition) + 1);
      } else if (screenPosition) {
        return;
      }

      let aboutToCache = {};
      this.messages.forEach(message => {
        let uuid = message.uuid;
        if (Boolean(uuid) && !this.cachedProfileData[uuid] && !aboutToCache[uuid]) {
          if (uuid === 'system' || this.currentProfileLoadedCount === this.currentProfileLoadedEnd) return;
          aboutToCache[uuid] = {};
          promises.push(axios.get(`/api/v3/members/${uuid}`));
          this.currentProfileLoadedCount += 1;
        }
      });

      let results = await Promise.all(promises);
      results.forEach(result => {
        // We could not load the user. Maybe they were deleted. So, let's cache empty so we don't try again
        if (!result || !result.data || result.status >= 400) {
          return;
        }

        let userData = result.data.data;
        this.$set(this.cachedProfileData, userData._id, userData);
      });

      // Merge in any attempts that were rejected so we don't attempt again
      for (let uuid in aboutToCache) {
        if (!this.cachedProfileData[uuid]) {
          this.$set(this.cachedProfileData, uuid, {rejected: true});
        }
      }
    },
    displayDivider (message) {
      if (this.currentDayDividerDisplay !== moment(message.timestamp).day()) {
        this.currentDayDividerDisplay = moment(message.timestamp).day();
        return true;
      }

      return false;
    },
    likeCount (message) {
      if (!message.likes) return 0;

      let likeCount = 0;
      for (let key in message.likes) {
        let like = message.likes[key];
        if (like) likeCount += 1;
      }
      return likeCount;
    },
    async like (messageToLike, index) {
      let message = cloneDeep(messageToLike);

      await this.$store.dispatch('chat:like', {
        groupId: this.groupId,
        chatId: message.id,
      });

      if (!message.likes[this.user._id]) {
        message.likes[this.user._id] = true;
      } else {
        message.likes[this.user._id] = !message.likes[this.user._id];
      }

      this.chat.splice(index, 1, message);
    },
    copyAsTodo (message) {
      this.copyingMessage = message;
      this.$root.$emit('bv::show::modal', 'copyAsTodo');
    },
    async report (message) {
      this.$store.state.flagChatOptions.message = message;
      this.$store.state.flagChatOptions.groupId = this.groupId;

      this.$root.$emit('bv::show::modal', 'report-flag');
    },
    async remove (message, index) {
      if (!confirm(this.$t('areYouSureDeleteMessage'))) return;

      this.chat.splice(index, 1);

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
      const profile = this.cachedProfileData[memberId];

      // Open the modal only if the data is available
      if (profile && !profile.rejected) {
        // @TODO move to action or anyway move from here because it's super duplicate
        this.$store.state.profileUser = profile;
        this.$store.state.profileOptions.startingPage = 'profile';
        this.$root.$emit('bv::show::modal', 'profile');
      }
    },
  },
};
</script>
