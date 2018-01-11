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
        .col-4.offset-4
          .svg-icon.close(v-html="icons.svgClose", @click='close()')
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
          .conversation(v-for='conversation in filtersConversations', @click='selectConversation(conversation.key)',
            :class="{active: selectedConversation.key === conversation.key}")
            div
             span(:class="userLevelStyle(conversation)") {{conversation.name}}
             span.timeago {{conversation.date | timeAgo}}
            div {{conversation.lastMessageText.substring(0, 30)}}
      .col-8.messages
        .empty-messages.text-center(v-if='activeChat.length === 0 && !selectedConversation.key')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4(v-once) Nothing Here Yet
          p(v-once) Select a conversation on the left
        .empty-messages.text-center(v-if='activeChat.length === 0 && selectedConversation.key')
          p {{ $t('beginningOfConversation', {userName: selectedConversation.name})}}
        chat-message.message-scroll(:chat.sync='activeChat', :inbox='true', ref="chatscroll")

        // @TODO: Implement new message header here when we fix the above

        .new-message-row(v-if='selectedConversation.key')
          textarea(v-model='newMessage')
          button.btn.btn-secondary(@click='sendPrivateMessage()') Send
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .envelope {
    color: $gray-400 !important;
    margin-top: 1em;
  }

  .close {
    margin-top: .5em;
    width: 15px;
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

    textarea {
      height: 80%;
      display: inline-block;
      vertical-align: bottom;
      width: 80%;
    }

    button {
      vertical-align: bottom;
      display: inline-block;
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
import sortBy from 'lodash/sortBy';
import { mapState } from 'client/libs/store';
import styleHelper from 'client/mixins/styleHelper';

import messageIcon from 'assets/svg/message.svg';
import chatMessage from '../chat/chatMessages';
import svgClose from 'assets/svg/close.svg';

export default {
  mixins: [styleHelper],
  components: {
    chatMessage,
  },
  mounted () {
    this.$root.$on('habitica::new-inbox-message', (data) => {
      this.$root.$emit('bv::show::modal', 'inbox-modal');

      const conversation = this.conversations.find(convo => {
        return convo.key === data.userIdToMessage;
      });

      if (conversation) {
        this.selectConversation(data.userIdToMessage);
        return;
      }

      const newMessage = {
        text: '',
        timestamp: new Date(),
        user: data.userName,
        uuid: data.userIdToMessage,
        id: '',
      };
      this.$set(this.user.inbox.messages, data.userIdToMessage, newMessage);
      this.selectConversation(data.userIdToMessage);
    });
  },
  destroyed () {
    this.$root.$off('habitica::new-inbox-message');
  },
  data () {
    return {
      icons: Object.freeze({
        messageIcon,
        svgClose,
      }),
      displayCreate: true,
      selectedConversation: {},
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

        if (!conversations[userId]) {
          conversations[userId] = {
            name: message.user,
            key: userId,
            messages: [],
          };
        }

        let newMessage = {
          text: message.text,
          timestamp: message.timestamp,
          user: message.user,
          uuid: message.uuid,
          id: message.id,
        };

        if (message.sent) {
          newMessage.user = this.user.profile.name;
          newMessage.uuid = this.user._id;
        }

        if (newMessage.text) conversations[userId].messages.push(newMessage);
        conversations[userId].lastMessageText = message.text;
        conversations[userId].date = message.timestamp;
      }

      conversations = sortBy(conversations, [(o) => {
        return moment(o.date).toDate();
      }]);
      conversations = conversations.reverse();

      return conversations;
    },
    filtersConversations () {
      if (!this.search) return this.conversations;
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
      let convoFound = this.conversations.find((conversation) => {
        return conversation.key === key;
      });

      this.selectedConversation = convoFound;
      let activeChat = convoFound.messages;

      activeChat = sortBy(activeChat, [(o) => {
        return moment(o.timestamp).toDate();
      }]);

      this.$set(this, 'activeChat', activeChat);

      Vue.nextTick(() => {
        let chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
    sendPrivateMessage () {
      if (!this.newMessage) return;

      let convoFound = this.conversations.find((conversation) => {
        return conversation.key === this.selectedConversation.key;
      });

      this.$store.dispatch('members:sendPrivateMessage', {
        toUserId: this.selectedConversation.key,
        message: this.newMessage,
      });

      convoFound.messages.push({
        text: this.newMessage,
        timestamp: new Date(),
        user: this.user.profile.name,
        uuid: this.user._id,
      });

      this.activeChat = convoFound.messages;

      convoFound.lastMessageText = this.newMessage;
      convoFound.date = new Date();

      this.newMessage = '';

      Vue.nextTick(() => {
        let chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'inbox-modal');
    },
  },
};
</script>
