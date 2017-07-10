<template lang="pug">
  b-modal#inbox-modal(title="", :hide-footer="true", size='lg')
    .header-wrap.container(slot="modal-header")
      .row
        .col-4
          .row
            .col-2
              .svg-icon.envelope(v-html="icons.messageIcon")
            .col-6
              h2.text-center Messages
            .col-2.offset-1
              button.btn.btn-secondary(@click='toggleClick()') +
        .col-8.to-form(v-if='displayCreate')
          strong To:
          b-form-input
    .row
      .col-4.sidebar
        .search-section
          b-form-input(placeholder='Search', v-model='search')
        .empty-messages.text-center(v-if='filtersConversations.length === 0')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4 You don’t have any messages
          p Send a message to start a conversation!
        .conversations(v-if='filtersConversations.length > 0')
          .conversation(v-for='conversation in conversations', @click='selectConversation(conversation.key)', :class="{active: selectedConversation === conversation.key}")
            div
             span {{conversation.name}}
             span {{conversation.date}}
            div {{conversation.lastMessageText}}
      .col-8.messages
        .message(v-for='message in currentMessages') {{message.text}}
        .new-message-row(v-if='selectedConversation')
          b-form-input(v-model='newMessage')
          button.btn.btn-secondary(@click='sendPrivateMessage()') Send
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .envelope {
    color: #c3c0c7 !important;
    margin-top: 1em;
  }

  h2 {
    margin-top: .5em;
  }

  .sidebar {
    background-color: #f9f9f9;
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
  }

  .to-form input {
    width: 60%;
    display: inline-block;
    margin-left: 1em;
  }

  .empty-messages {
    margin-top: 10em;
    color: #c3c0c7;
    padding: 1em;

    h4 {
      color: #c3c0c7;
      margin-top: 1em;
    }

    .envelope {
      width: 30px;
      margin: 0 auto;
    }
  }

  .new-message-row {
    background-color: #f9f9f9;
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

  .conversation {
    padding: 1.5em;
    background: $white;
    height: 80px;
  }

  .conversation.active {
    border: 1px solid $purple-400;
  }

  .conversation:hover {
    cursor: pointer;
  }
</style>

<script>
import filter from 'lodash/filter';
import { mapState } from 'client/libs/store';

import bModal from 'bootstrap-vue/lib/components/modal';
import bFormInput from 'bootstrap-vue/lib/components/form-input';

import messageIcon from 'assets/svg/message.svg';

export default {
  components: {
    bModal,
    bFormInput,
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
    };
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

        conversations[userId].messages.push({
          text: message.text,
          timestamp: message.timestamp,
        });
        conversations[userId].lastMessageText = message.text;
        conversations[userId].date = new Date(message.timestamp);
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
      this.conversations[this.selectedConversation].lastMessageText = this.newMessage;
      this.conversations[this.selectedConversation].date = new Date();

      this.newMessage = '';
    },
  },
};
</script>
