<template lang="pug">
.container
  .row
    .col-12
      copy-as-todo-modal(:copying-message='copyingMessage', :group-name='groupName', :group-id='groupId')
      report-flag-modal
  .row
    .hr.col-12

  .row(v-for="(msg, index) in chat", v-if='chat && Object.keys(cachedProfileData).length > 0')
    // @TODO: is there a different way to do these conditionals? This creates an infinite loop
    //.hr(v-if='displayDivider(msg)')
      .hr-middle(v-once) {{ msg.timestamp }}
    .col-2
      avatar(v-if='cachedProfileData[msg.uuid]',
        :member="cachedProfileData[msg.uuid]", :avatarOnly="true",
        :hideClassBadge='true')

    .card.col-10
      .card-block
          h3.leader {{msg.user}}
          p {{msg.timestamp | timeAgo}}
          .text(v-markdown='msg.text')
          hr
          .action(@click='like(msg, index)', v-if='msg.likes', :class='{active: msg.likes[user._id]}')
            .svg-icon(v-html="icons.like")
            span(v-if='!msg.likes[user._id]') {{ $t('like') }}
            span(v-if='msg.likes[user._id]') {{ $t('liked') }}
          span.action( @click='copyAsTodo(msg)')
            .svg-icon(v-html="icons.copy")
            | {{$t('copyAsTodo')}}
          span.action(v-if='user.contributor.admin || (msg.uuid !== user._id && user.flags.communityGuidelinesAccepted)', @click='report(msg)')
            .svg-icon(v-html="icons.report")
            | {{$t('report')}}
          span.action(v-if='msg.uuid === user._id', @click='remove(msg, index)')
            .svg-icon(v-html="icons.delete")
            | {{$t('delete')}}
          span.action.float-right
            .svg-icon(v-html="icons.liked")
            | + {{ likeCount(msg) }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
  }

  .action {
    display: inline-block;
    color: #878190;
    margin-right: 1em;
  }

  .action:hover {
    cursor: pointer;
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
import Bluebird from 'bluebird';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import { mapState } from 'client/libs/store';
import markdownDirective from 'client/directives/markdown';
import Avatar from '../avatar';

import copyAsTodoModal from './copyAsTodoModal';
import reportFlagModal from './reportFlagModal';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';

export default {
  props: ['chat', 'groupId', 'groupName'],
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
  data () {
    return {
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        liked: likedIcon,
      }),
      copyingMessage: {},
      currentDayDividerDisplay: moment().day(),
      cachedProfileData: {},
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
    messages () {
      return this.chat;
    },
  },
  watch: {
    messages () {
      // @TODO: MAybe we should watch insert and remove?
      this.loadProfileCache();
    },
  },
  methods: {
    async loadProfileCache () {
      let promises = [];

      this.messages.forEach(message => {
        let uuid = message.uuid;
        if (uuid && !this.cachedProfileData[uuid]) {
          if (uuid === 'system') return;
          promises.push(axios.get(`/api/v3/members/${uuid}`));
        }
      });

      let results = await Bluebird.all(promises);
      results.forEach(result => {
        let userData = result.data.data;
        this.$set(this.cachedProfileData, userData._id, userData);
      });
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
      return Object.keys(message.likes).length;
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
      this.$root.$emit('show::modal', 'copyAsTodo');
    },
    async report (message) {
      this.$store.state.flagChatOptions.message = message;
      this.$store.state.flagChatOptions.groupId = this.groupId;

      this.$root.$emit('show::modal', 'report-flag');
    },
    async remove (message, index) {
      this.chat.splice(index, 1);
      await this.$store.dispatch('chat:deleteChat', {
        groupId: this.groupId,
        chatId: message.id,
      });
    },
  },
};
</script>
