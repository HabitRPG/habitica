<template lang="pug">
  b-modal#inbox-modal(title="", :hide-footer="true", size='lg')
    .header-wrap.container(slot="modal-header")
      .row
        .col-4
          .row
            .col-2
              .svg-icon.envelope(v-html="icons.messageIcon")
            .col-6
              h2.text-center(v-once) {{$t('messages')}}
            // @TODO: Implement this after we fix username bug
            // .col-2.offset-1
            //  button.btn.btn-secondary(@click='toggleClick()') +
        // .col-8.to-form(v-if='displayCreate')
        //   strong To:
        // b-form-input
    .row
      .col-4.sidebar
        .search-section
          b-form-input(:placeholder="$t('search')", v-model='search')
        .empty-messages.text-center(v-if='filtersConversations.length === 0')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4(v-once) {{$t('emptyMessagesLine1')}}
          p(v-once) {{$t('emptyMessagesLine2')}}
        .conversations(v-if='filtersConversations.length > 0')
          .conversation(v-for='conversation in conversations', @click='selectConversation(conversation.key)',
            :class="{active: selectedConversation === conversation.key}")
            div
             span(:class="userLevelStyle(conversation)") {{conversation.name}}
             span.timeago {{conversation.date | timeAgo}}
            div {{conversation.lastMessageText.substring(0, 30)}}
      .col-8.messages
        chat-message.container-fluid.message-scroll(:chat.sync='activeChat', :inbox='true', ref="chatscroll")

        // @TODO: Implement new message header here when we fix the above

        .new-message-row(v-if='selectedConversation')
          input(v-model='newMessage')
          button.btn.btn-secondary(@click='sendPrivateMessage()') Send
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .envelope {
    color: $gray-400 !important;
    margin-top: 1em;
  }

  h2 {
    margin-top: .5em;
  }

  .sidebar {
    background-color: $gray-700;
    min-height: 600px;
    padding: 0;

    .search-section {
      padding: 1em;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }
  }

  .messages {
    position: relative;
    padding-left: 0;
    padding-bottom: 6em;
  }

  .message-scroll {
    max-height: 500px;
    overflow: scroll;
  }

  .to-form input {
    width: 60%;
    display: inline-block;
    margin-left: 1em;
  }

  .empty-messages {
    margin-top: 10em;
    color: $gray-400;
    padding: 1em;

    h4 {
      color: $gray-400;
      margin-top: 1em;
    }

    .envelope {
      width: 30px;
      margin: 0 auto;
    }
  }

  .new-message-row {
    background-color: $gray-700;
    position: absolute;
    bottom: 0;
    height: 88px;
    width: 100%;
    padding: 1em;

    input {
      display: inline-block;
      width: 80%;
    }

    button {
      box-shadow: none;
      margin-left: 1em;
    }
  }

  .conversations {
    max-height: 400px;
    overflow: scroll;
  }

  .conversation {
    padding: 1.5em;
    background: $white;
    height: 80px;

    .timeago {
      margin-left: 1em;
    }
  }

  .conversation.active {
    border: 1px solid $purple-400;
  }

  .conversation:hover {
    cursor: pointer;
  }
</style>

<script>
import Vue from 'vue';
import moment from 'moment';
import filter from 'lodash/filter';
// import sortBy from 'lodash/sortBy';
import { mapState } from 'client/libs/store';
import styleHelper from 'client/mixins/styleHelper';

import bModal from 'bootstrap-vue/lib/components/modal';
import bFormInput from 'bootstrap-vue/lib/components/form-input';

import messageIcon from 'assets/svg/message.svg';
import chatMessage from '../chat/chatMessages';

export default {
  mixins: [styleHelper],
  components: {
    bModal,
    bFormInput,
    chatMessage,
  },
  data () {
    return {
      icons: Object.freeze({
        messageIcon,
      }),
      displayCreate: true,
      selectedConversation: '',
      search: '',
      newMessage: '',
      activeChat: [],
    };
  },
  filters: {
    timeAgo (value) {
      return moment(new Date(value)).fromNow();
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
    conversations () {
      let conversations = {};
      for (let messageId in this.user.inbox.messages) {
        let message = this.user.inbox.messages[messageId];
        let userId = message.uuid;

        if (!this.selectedConversation) {
          this.selectedConversation = userId;
          this.selectConversation(userId);
        }

        if (!conversations[userId]) {
          conversations[userId] = {
            name: message.user,
            key: userId,
            messages: [],
          };
        }

        conversations[userId].messages.push({
          text: message.text,
          timestamp: message.timestamp,
        });
        conversations[userId].lastMessageText = message.text;
        conversations[userId].date = message.timestamp;
      }

      return conversations;
    },
    currentMessages () {
      if (!this.selectedConversation) return;
      return this.conversations[this.selectedConversation].messages;
    },
    filtersConversations () {
      if (!this.search) return Object.values(this.conversations);
      return filter(this.conversations, (conversation) => {
        return conversation.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1;
      });
    },
  },
  methods: {
    toggleClick () {
      this.displayCreate = !this.displayCreate;
    },
    selectConversation (key) {
      this.selectedConversation = key;
      let activeChat = this.conversations[this.selectedConversation].messages;
      // @TODO: I think I did this wrong
      // activeChat = sortBy(this.activeChat, [(o) => {
      //   return o.timestamp;
      // }]);
      this.$set(this, 'activeChat', activeChat);
      Vue.nextTick(() => {
        let chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
    sendPrivateMessage () {
      this.$store.dispatch('members:sendPrivateMessage', {
        toUserId: this.selectedConversation,
        message: this.newMessage,
      });

      this.conversations[this.selectedConversation].messages.push({
        text: this.newMessage,
        timestamp: new Date(),
      });

      this.activeChat = this.conversations[this.selectedConversation].messages;

      this.conversations[this.selectedConversation].lastMessageText = this.newMessage;
      this.conversations[this.selectedConversation].date = new Date();

      this.newMessage = '';

      Vue.nextTick(() => {
        let chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
  },
};
</script>
