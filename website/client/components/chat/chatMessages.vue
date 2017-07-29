<template lang="pug">
div
  copy-as-todo-modal(:copying-message='copyingMessage', :group-name='groupName', :group-id='groupId')
  .row
    // .col-md-2
    // @TODO: Implement when we pull avatars .svg-icon(v-html="icons.like")
    .col-md-12(v-for="(msg, index) in chat", :key="msg.id")
      .card
        .card-block
          h3.leader {{msg.user}}
          p {{msg.timestamp | timeAgo}}
          .text {{msg.text}}
          hr
          .action(v-once, @click='like(msg)', :class='{active: msg.likes[user._id]}')
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
import { mapState } from 'client/libs/store';

import copyAsTodoModal from './copyAsTodoModal';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';

export default {
  props: ['chat', 'groupId', 'groupName'],
  components: {
    copyAsTodoModal,
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
      messages: [],
    };
  },
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    likeCount (message) {
      return Object.keys(message.likes).length;
    },
    async like (message) {
      if (!message.likes[this.user._id]) {
        message.likes[this.user._id] = true;
      } else {
        message.likes[this.user._id] = !message.likes[this.user._id];
      }

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
      await this.$store.dispatch('chat:flag', {
        groupId: this.groupId,
        chatId: message.id,
      });
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
