<template lang="pug">
  page-layout(:showSidebar='false')
    div(slot='page')
      .d-flex.w-100.align-items-center
        .d-flex.w-25.mb-3.align-items-center
          .svg-icon.envelope.m-auto(v-html="icons.messageIcon")
          h2.flex-fill.text-center.pr-5.m-auto(v-once) {{ $t('messages') }}
        .d-flex.flex-row-reverse.w-75.ml-auto.align-items-center
          toggle-switch(
            :label="optTextSet.switchDescription",
            :checked="!this.user.inbox.optOut"
            :hoverText="optTextSet.popoverText",
            @change="toggleOpt()"
          )
      .d-flex
        .w-25.sidebar.d-flex.flex-column
          .search-section
            b-form-input.input-search(:placeholder="$t('search')", v-model='search')
          .empty-messages.m-auto.text-center(v-if='filtersConversations.length === 0')
            .svg-icon.envelope(v-html="icons.messageIcon", v-once)
            h4(v-once) {{ $t('emptyMessagesLine1') }}
            p(v-if="!user.flags.chatRevoked") {{ $t('emptyMessagesLine2') }}
          .conversations(v-if='filtersConversations.length > 0')
            .conversation(v-for='conversation in filtersConversations', @click='selectConversation(conversation.key)',
              :class="{active: selectedConversation.key === conversation.key}")
              div
                h3(:class="userLevelStyle(conversation)") {{ conversation.name }}
                  .svg-icon(v-html="tierIcon(conversation)")
              .time
                span.mr-1(v-if='conversation.username') @{{ conversation.username }} •
                span {{ conversation.date | timeAgo }}
              div {{ conversation.lastMessageText ? conversation.lastMessageText.substring(0, 30) : '' }}
        .w-75.messages.d-flex.flex-column.align-items-center
          .empty-messages.m-auto.text-center(v-if='!selectedConversation.key')
            .svg-icon.envelope(v-html="icons.messageIcon", v-once)
            h4 {{ placeholderTexts.title }}
            p(v-html="placeholderTexts.description")
          .empty-messages.mt-auto.text-center(v-if='selectedConversation.key && selectedConversationMessages.length === 0')
            h3 {{ $t('beginningOfConversation', {userName: selectedConversation.name}) }}
            p {{ $t('beginningOfConversationReminder') }}
          private-messages.message-scroll(
            v-if="selectedConversation.messages && selectedConversationMessages.length > 0",
            :chat='selectedConversationMessages',
            @message-removed='messageRemoved',
            ref="chatscroll"
          )
          .pm-disabled-caption.text-center(v-if="user.inbox.optOut && selectedConversation.key")
            h4 {{ $t('PMDisabledCaptionTitle') }}
            p {{ $t('PMDisabledCaptionText') }}
          .new-message-row.d-flex.align-items-center(v-if='selectedConversation.key && !user.flags.chatRevoked')
            textarea.flex-fill(
              v-model='newMessage',
              @keyup.ctrl.enter='sendPrivateMessage()',
              maxlength='3000'
            )
            button.btn.btn-primary(@click='sendPrivateMessage()') {{ $t('send') }}
          .length-readout(v-if='selectedConversation.key && !user.flags.chatRevoked')
            .ml-3 {{ currentLength }} / 3000
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/tiers.scss';

  .conversations {
    max-height: 35rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .conversation {
    padding: 1.5em;
    background: $white;
    border: 1px solid $white;
  }

  .conversation.active {
    border: 1px solid $purple-400;
  }

  .conversation:hover {
    cursor: pointer;
  }

  .empty-messages {
    h3, h4, p {
      color: $gray-200;
      margin: 0rem;
    }

    p {
      font-size: 12px;
    }

    .envelope {
      width: 30px;
      margin: 0 auto 0.5rem;
    }
  }

  .envelope {
    color: $gray-500 !important;
    margin: 0rem;
    max-width: 2rem;
  }

  h3 {
    margin: 0rem;

    .svg-icon {
      width: 10px;
      display: inline-block;
      margin-left: .5em;
    }
  }

  .length-readout {
    background-color: $gray-700;
    width: 100%;
    border-bottom-right-radius: 3px;
    margin: auto 0rem 0rem 0rem;
    padding-bottom: 0.25rem;
  }

  .messages {
    padding: 0rem;
  }

  .message-scroll {
    height: 33.5rem;
    overflow-x: scroll;
    padding-top: 0.5rem;

    @media (min-width: 992px) {
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }

  .new-message-row {
    background-color: $gray-700;
    height: 4rem;
    width: 100%;
    padding-left: 1rem;
    padding-top: 1rem;

    textarea {
      height: 2.7rem;
      display: inline-block;
      vertical-align: bottom;
      z-index: 5;
    }

    button {
      vertical-align: bottom;
      display: inline-block;
      box-shadow: none;
      margin: 0rem 0.75rem;
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

  .sidebar {
    background-color: $gray-700;
    min-height: 600px;
    padding: 0;
    border-bottom-left-radius: 3px;

    .search-section {
      padding: 1em;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }
  }

  .time {
    font-size: 12px;
    color: $gray-200;
    margin-bottom: 0.5rem;
  }

  .to-form input {
    width: 60%;
    display: inline-block;
    margin-left: 1em;
  }
</style>

<script>
  import PageLayout from 'client/components/ui/pageLayout';
  import Vue from 'vue';
  import moment from 'moment';
  import filter from 'lodash/filter';
  import sortBy from 'lodash/sortBy';
  import groupBy from 'lodash/groupBy';
  import { mapState } from 'client/libs/store';
  import styleHelper from 'client/mixins/styleHelper';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import axios from 'axios';

  import privateMessages from './messageList';
  import messageIcon from 'assets/svg/message.svg';
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
    mixins: [styleHelper],
    components: {
      privateMessages,
      toggleSwitch,
      PageLayout,
    },
    mounted () {
      this.initiatedConversation = {
        uuid: this.$store.state.privateMessageOptions.userIdToMessage,
        user: this.$store.state.privateMessageOptions.displayName,
        username: this.$store.state.privateMessageOptions.username,
        backer: this.$store.state.privateMessageOptions.backer,
        contributor: this.$store.state.privateMessageOptions.contributor,
      };
      /* TODO this not working yet
        // Wait for messages to be loaded
        const unwatchLoaded = this.$watch('loaded', (loaded) => {
          if (!loaded) return;

          const conversation = this.conversations.find(convo => {
            return convo.key === data.userIdToMessage;
          });
          if (loaded) setImmediate(() => unwatchLoaded());

          if (conversation) {
            this.selectConversation(data.userIdToMessage);
            return;
          }

          this.initiatedConversation = {
            uuid: data.userIdToMessage,
            user: data.displayName,
            username: data.username,
            backer: data.backer,
            contributor: data.contributor,
          };

          this.selectConversation(data.userIdToMessage);
        }, {immediate: true});
      }); */
    },
    destroyed () {
      this.$root.$off('habitica::new-private-message');
    },
    data () {
      return {
        icons: Object.freeze({
          messageIcon,
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
        displayCreate: true,
        selectedConversation: {},
        search: '',
        newMessage: '',
        showPopover: false,
        messages: [],
        loaded: false,
        initiatedConversation: null,
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
        const inboxGroup = groupBy(this.messages, 'uuid');

        // Add placeholder for new conversations
        if (this.initiatedConversation && this.initiatedConversation.uuid) {
          inboxGroup[this.initiatedConversation.uuid] = [{
            uuid: this.initiatedConversation.uuid,
            user: this.initiatedConversation.user,
            username: this.initiatedConversation.username,
            id: '',
            text: '',
            timestamp: new Date(),
          }];
        }
        // Create conversation objects
        const convos = [];
        for (let key in inboxGroup) {
          const convoSorted = sortBy(inboxGroup[key], [(o) => {
            return (new Date(o.timestamp)).getTime();
          }]);

          // Fix poor inbox chat models
          const newChatModels = convoSorted.map(chat => {
            let newChat = Object.assign({}, chat);
            if (newChat.sent) {
              newChat.toUUID = newChat.uuid;
              newChat.toUser = newChat.user;
              newChat.toUserName = newChat.username;
              newChat.toUserContributor = newChat.contributor;
              newChat.toUserBacker = newChat.backer;
              newChat.uuid = this.user._id;
              newChat.user = this.user.profile.name;
              newChat.username = this.user.auth.local.username;
              newChat.contributor = this.user.contributor;
              newChat.backer = this.user.backer;
            }
            return newChat;
          });

          // In case the last message is a placeholder, remove it
          const recentMessage = newChatModels[newChatModels.length - 1];
          if (!recentMessage.text) newChatModels.splice(newChatModels.length - 1, 1);

          const convoModel = {
            key: recentMessage.toUUID ? recentMessage.toUUID : recentMessage.uuid,
            name: recentMessage.toUser ? recentMessage.toUser : recentMessage.user, // Handles case where from user sent the only message or the to user sent the only message
            username: !recentMessage.text ? recentMessage.username : recentMessage.toUserName,
            date: recentMessage.timestamp,
            lastMessageText: recentMessage.text,
            messages: newChatModels,
          };

          convos.push(convoModel);
        }

        // Sort models by most recent
        const conversations = sortBy(convos, [(o) => {
          return moment(o.date).toDate();
        }]);

        return conversations.reverse();
      },
      // Separate from selectedConversation which is not coputed so messages don't update automatically
      selectedConversationMessages () {
        const selectedConversationKey = this.selectedConversation.key;
        const selectedConversation = this.conversations.find(c => c.key === selectedConversationKey);
        return selectedConversation ? selectedConversation.messages : [];
      },
      filtersConversations () {
        if (!this.search) return this.conversations;
        return filter(this.conversations, (conversation) => {
          return conversation.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1;
        });
      },
      currentLength () {
        return this.newMessage.length;
      },
      placeholderTexts () {
        if (this.user.flags.chatRevoked) {
          return {
            title: this.$t('PMPlaceholderTitleRevoked'),
            description: this.$t('PMPlaceholderDescriptionRevoked'),
          };
        }
        return {
          title: this.$t('PMPlaceholderTitle'),
          description: this.$t('PMPlaceholderDescription'),
        };
      },
      optTextSet () {
        if (!this.user.inbox.optOut) {
          return {
            switchDescription: this.$t('PMReceive'),
            popoverText: this.$t('PMEnabledOptPopoverText'),
          };
        }
        return {
          switchDescription: this.$t('PMReceive'),
          popoverText: this.$t('PMDisabledOptPopoverText'),
        };
      },
    },
    methods: {
      async onModalShown () {
        this.loaded = false;
        const res = await axios.get('/api/v4/inbox/messages');
        this.messages = res.data.data;
        this.loaded = true;
      },
      onModalHide () {
        this.messages = [];
        this.loaded = false;
        this.initiatedConversation = null;
      },
      messageRemoved (message) {
        const messageIndex = this.messages.findIndex(msg => msg.id === message.id);
        if (messageIndex !== -1) this.messages.splice(messageIndex, 1);
        if (this.selectedConversationMessages.length === 0) this.initiatedConversation = {
          uuid: this.selectedConversation.key,
          user: this.selectedConversation.name,
          username: this.selectedConversation.username,
          backer: this.selectedConversation.backer,
          contributor: this.selectedConversation.contributor,
        };
      },
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

        this.selectedConversation = convoFound || {};

        Vue.nextTick(() => {
          if (!this.$refs.chatscroll) return;
          let chatscroll = this.$refs.chatscroll.$el;
          chatscroll.scrollTop = chatscroll.scrollHeight;
        });
      },
      sendPrivateMessage () {
        if (!this.newMessage) return;

        this.messages.push({
          sent: true,
          text: this.newMessage,
          timestamp: new Date(),
          user: this.selectedConversation.name,
          username: this.selectedConversation.username,
          uuid: this.selectedConversation.key,
          contributor: this.user.contributor,
        });

        // Remove the placeholder message
        if (this.initiatedConversation && this.initiatedConversation.uuid === this.selectedConversation.key) {
          this.initiatedConversation = null;
        }

        this.selectedConversation.lastMessageText = this.newMessage;
        this.selectedConversation.date = new Date();

        Vue.nextTick(() => {
          if (!this.$refs.chatscroll) return;
          let chatscroll = this.$refs.chatscroll.$el;
          chatscroll.scrollTop = chatscroll.scrollHeight;
        });

        this.$store.dispatch('members:sendPrivateMessage', {
          toUserId: this.selectedConversation.key,
          message: this.newMessage,
        }).then(response => {
          const newMessage = response.data.data.message;
          Object.assign(this.messages[this.messages.length - 1], newMessage);
        });

        this.newMessage = '';
      },
      tierIcon (message) {
        const isNPC = Boolean(message.backer && message.backer.npc);
        if (isNPC) {
          return this.icons.tierNPC;
        }
        if (!message.contributor) return;
        return this.icons[`tier${message.contributor.level}`];
      },
    },
  };
</script>
