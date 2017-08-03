<template lang="pug">
div
  copy-as-todo-modal(:copying-message='copyingMessage', :group-name='groupName', :group-id='groupId')
  report-flag-modal
  .row
    // .col-md-2
    // @TODO: Implement when we pull avatars .svg-icon(v-html="icons.like")

    .hr

    .col-md-12(v-for="(msg, index) in chat", :key="msg.id", v-if='chat')
      // @TODO: is there a different way to do these conditionals? This creates an infinite loop
      //.hr(v-if='displayDivider(msg)')
        .hr-middle(v-once) {{ msg.timestamp }}

      .card
        .card-block
          h3.leader {{msg.user}}
          p {{msg.timestamp | timeAgo}}
          .text {{msg.text}}
          hr
          .action(v-once, @click='like(msg, index)', v-if='msg.likes', :class='{active: msg.likes[user._id]}')
            .svg-icon(v-html="icons.like")
            span(v-if='!msg.likes[user._id]') {{ $t('like') }}
            span(v-if='msg.likes[user._id]') {{ $t('liked') }}
          span.action(v-once,  @click='copyAsTodo(msg)')
            .svg-icon(v-html="icons.copy")
            | {{$t('copyAsTodo')}}
          span.action(v-once, v-if='user.contributor.admin || (!msg.sent && user.flags.communityGuidelinesAccepted)', @click='report(msg)')
            .svg-icon(v-html="icons.report")
            | {{$t('report')}}
          span.action(v-once, v-if='msg.uuid === user._id', @click='remove(msg, index)')
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
    margin-bottom: 1em;
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
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import { mapState } from 'client/libs/store';

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
  methods: {
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

      if (!message.likes[this.user._id]) {
        message.likes[this.user._id] = true;
      } else {
        message.likes[this.user._id] = !message.likes[this.user._id];
      }

      this.chat.splice(index, 1, message);

      await this.$store.dispatch('chat:like', {
        groupId: this.groupId,
        chatId: message.id,
      });
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
