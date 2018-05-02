<template lang="pug">
  b-modal#inbox-modal(title="", :hide-footer="true", size='lg')
    .header-wrap.container.align-items-center(slot="modal-header")
      .row.align-items-center
        .col-4
          .row.align-items-center
            .col-2
              .svg-icon.envelope(v-html="icons.messageIcon")
            .col-6
              h2.text-center(v-once) {{$t('messages')}}
            // @TODO: Implement this after we fix username bug
            // .col-2.offset-1
            //  button.btn.btn-secondary(@click='toggleClick()') +
        .col-4.offset-4
          .svg-icon.close(v-html="icons.svgClose", @click='close()')
          toggle-switch.float-right(
            :label="optTextSet.switchDescription",
            :checked="!this.user.inbox.optOut"
            :hoverText="optTextSet.popoverText",
            @change="toggleOpt()"
          )
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
            div {{conversation.lastMessageText ? conversation.lastMessageText.substring(0, 30) : ''}}
      .col-8.messages.d-flex.flex-column.justify-content-between
        .empty-messages.text-center(v-if='activeChat.length === 0 && !selectedConversation.key')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4(v-once) Nothing Here Yet
          p(v-once) Select a conversation on the left
        .empty-messages.text-center(v-if='activeChat.length === 0 && selectedConversation.key')
          p {{ $t('beginningOfConversation', {userName: selectedConversation.name})}}
        chat-message.message-scroll(v-if="activeChat.length > 0", :chat.sync='activeChat', :inbox='true', ref="chatscroll")
        .pm-disabled-caption.text-center(v-if="user.inbox.optOut && selectedConversation.key")
          h4 {{$t('PMDisabledCaptionTitle')}}
          p {{$t('PMDisabledCaptionText')}}

        // @TODO: Implement new message header here when we fix the above

        .new-message-row(v-if='selectedConversation.key')
          textarea(v-model='newMessage')
          button.btn.btn-secondary(@click='sendPrivateMessage()') Send
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header-wrap {
    padding: 0.5em;

    h2 {
      margin: 0;
      line-height: 1;
    }
  }

  .envelope {
    color: $gray-400 !important;
    margin: 0;
  }

  .close {
    margin-top: .5em;
    width: 15px;
    position: absolute;
    top: -1.9em;
    right: 0.3em;
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
    overflow-x: scroll;

    @media (min-width: 992px) {
      overflow-x: hidden;
      overflow-y: scroll;
    }
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

  .pm-disabled-caption {

    padding-top: 1em;
    background-color: $gray-700;
    z-index: 2;

    h4, p {
      color: $gray-300;
    }

    h4 {
      margin-top: 0;
      margin-bottom: 0.4em;
    }

    p {
      font-size: 12px;
      margin-bottom: 0;
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
    overflow-x: hidden;
    overflow-y: scroll;
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
import groupBy from 'lodash/groupBy';
import { mapState } from 'client/libs/store';
import styleHelper from 'client/mixins/styleHelper';
import toggleSwitch from 'client/components/ui/toggleSwitch';

import messageIcon from 'assets/svg/message.svg';
import chatMessage from '../chat/chatMessages';
import svgClose from 'assets/svg/close.svg';

export default {
  mixins: [styleHelper],
  components: {
    chatMessage,
    toggleSwitch,
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
      showPopover: false,
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
      const inboxGroup = groupBy(this.user.inbox.messages, 'uuid');

      // Create conversation objects
      const convos = [];
      for (let key in inboxGroup) {
        const convoSorted = sortBy(inboxGroup[key], [(o) => {
          return o.timestamp;
        }]);

        // Fix poor inbox chat models
        const newChatModels = convoSorted.map(chat => {
          let newChat = Object.assign({}, chat);
          if (newChat.sent) {
            newChat.toUUID = newChat.uuid;
            newChat.toUser = newChat.user;
            newChat.uuid = this.user._id;
            newChat.user = this.user.profile.name;
            newChat.contributor = this.user.contributor;
            newChat.backer = this.user.backer;
          }
          return newChat;
        });

        const recentMessage = newChatModels[newChatModels.length - 1];

        // Special case where we have placeholder message because conversations are just grouped messages for now
        if (!recentMessage.text) {
          newChatModels.splice(newChatModels.length - 1, 1);
        }

        const convoModel = {
          name: recentMessage.toUser ? recentMessage.toUser : recentMessage.user, // Handles case where from user sent the only message or the to user sent the only message
          key: recentMessage.toUUID ? recentMessage.toUUID : recentMessage.uuid,
          messages: newChatModels,
          lastMessageText: recentMessage.text,
          date: recentMessage.timestamp,
        };

        convos.push(convoModel);
      }

      // Sort models by most recent
      const conversations = sortBy(convos, [(o) => {
        return moment(o.date).toDate();
      }]);

      return conversations.reverse();
    },
    filtersConversations () {
      if (!this.search) return this.conversations;
      return filter(this.conversations, (conversation) => {
        return conversation.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1;
      });
    },
    optTextSet () {
      if (!this.user.inbox.optOut) {
        return {
          switchDescription: this.$t('PMDisable'),
          popoverText: this.$t('PMEnabledOptPopoverText'),
        };
      }
      return {
        switchDescription: this.$t('PMEnable'),
        popoverText: this.$t('PMDisabledOptPopoverText'),
      };
    },
  },
  methods: {
    toggleClick () {
      this.displayCreate = !this.displayCreate;
    },
    toggleOpt () {
      this.$store.dispatch('user:togglePrivateMessagesOpt');
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
        if (!this.$refs.chatscroll) return;
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
        contributor: this.user.contributor,
      });

      this.activeChat = convoFound.messages;

      convoFound.lastMessageText = this.newMessage;
      convoFound.date = new Date();

      this.newMessage = '';

      Vue.nextTick(() => {
        if (!this.$refs.chatscroll) return;
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
