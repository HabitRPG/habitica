<template lang="pug">
  #private-message
    .header-bar.d-flex.w-100
      .d-flex.w-25
        .mail-icon.svg-icon(v-html="icons.mail", v-once)
        h2.flex-fill.text-center(v-once) {{ $t('messages') }}
      .d-flex.w-75
        div Selected Conversation

    .d-flex
      .w-25.sidebar.d-flex.flex-column
        .disable-background
          .svg-icon.close(aria-hidden="true", v-html="icons.svgClose", @click="close()", v-once)
          toggle-switch(
            :label="optTextSet.switchDescription",
            :checked="this.user.inbox.optOut"
            :hoverText="optTextSet.popoverText",
            @change="toggleOpt()"
          )
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
              span(v-if="conversation.date") {{ conversation.date | timeAgo }}
            div.messagePreview {{ conversation.lastMessageText ? removeTags(parseMarkdown(conversation.lastMessageText)) : '' }}
      .w-75.messages.d-flex.flex-column.align-items-center
        .empty-messages.m-auto.text-center(v-if='!selectedConversation.key')
          .svg-icon.envelope(v-html="icons.messageIcon", v-once)
          h4 {{ placeholderTexts.title }}
          p(v-html="placeholderTexts.description")
        .empty-messages.mt-auto.text-center(v-if='selectedConversation.key && selectedConversationMessages.length === 0')
          h3 {{ $t('beginningOfConversation', {userName: selectedConversation.name}) }}
          p {{ $t('beginningOfConversationReminder') }}
        private-messages.message-scroll(
          v-if="selectedConversation && selectedConversationMessages.length > 0",
          :chat='selectedConversationMessages',
          @message-removed='messageRemoved',
          ref="chatscroll",

          :canLoadMore="canLoadMore",
          :isLoading="messagesLoading",
          @triggerLoad="infiniteScrollTrigger"
        )
        .pm-disabled-caption.text-center(v-if="user.inbox.optOut")
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

<style lang="scss">
  #messages-modal {
    h2 {
      margin-bottom: 0rem;
    }

    .modal-body {
      padding: 0rem;
    }

    .modal-content {
      width: 66vw;
    }

    .modal-dialog {
      margin: 10vh 15vw 0rem;
    }

    .modal-header {
      padding: 1rem 0rem;

      .close {
        cursor: pointer;
        margin: 0rem 1.5rem;
        min-width: 0.75rem;
        padding: 0rem;
        width: 0.75rem;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/tiers.scss';

  .header-bar {
    height: 64px;
    margin-top: 1rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    background-color: $white;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-top: 1.25rem;

    .mail-icon {
      width: 32px;
      height: 24px;
      object-fit: contain;
    }
  }

  .disable-background {
    height: 44px;
    background-color: $gray-600;
    padding-top: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
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

  .conversations {
    max-height: 35rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .empty-messages {
    h3, h4, p {
      color: $gray-400;
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

  .header-wrap {
    padding: 0.5em;

    h2 {
      margin: 0;
      line-height: 1;
    }
  }

  .length-readout {
    background-color: $gray-700;
    width: 100%;
    border-bottom-right-radius: 3px;
    margin: auto 0rem 0rem 0rem;
    padding-bottom: 0.25rem;
  }

  .messagePreview {
    display: block;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
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
    min-height: 540px;
    padding: 0;
    border-bottom-lef-radius: 3px;

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
  import Vue from 'vue';
  import moment from 'moment';
  import filter from 'lodash/filter';
  import groupBy from 'lodash/groupBy';
  import orderBy from 'lodash/orderBy';
  import { mapState } from 'client/libs/store';
  import habiticaMarkdown from 'habitica-markdown';
  import styleHelper from 'client/mixins/styleHelper';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import axios from 'axios';

  import privateMessages from './messageList';
  import messageIcon from 'assets/svg/message.svg';
  import svgClose from 'assets/svg/close.svg';
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
  import mail from 'assets/svg/mail.svg';

  export default {
    mixins: [styleHelper],
    components: {
      privateMessages,
      toggleSwitch,
    },
    async mounted () {
      this.$root.$on('habitica::new-private-message', (data) => {
        this.$root.$emit('bv::show::modal', 'messages-modal');

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
      });

      this.loaded = false;

      const conversationRes = await axios.get('/api/v4/inbox/conversations');
      this.loadedConversations = conversationRes.data.data;

      this.loaded = true;
    },
    destroyed () {
      this.$root.$off('habitica::new-private-message');
    },
    data () {
      return {
        icons: Object.freeze({
          messageIcon,
          svgClose,
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
          mail,
        }),
        displayCreate: true,
        selectedConversation: {},
        search: '',
        newMessage: '',
        showPopover: false,
        messages: [],
        messagesByConversation: {}, // cache {uuid: []}
        loadedConversations: [],
        loaded: false,
        messagesLoading: false,
        initiatedConversation: null,
        updateConversationsCounter: 0,
      };
    },
    filters: {
      timeAgo (value) {
        return moment(new Date(value)).fromNow();
      },
    },
    computed: {
      ...mapState({user: 'user.data'}),
      canLoadMore () {
        return this.selectedConversation && this.selectedConversation.canLoadMore;
      },
      conversations () {
        const inboxGroup = groupBy(this.loadedConversations, 'uuid');

        // Add placeholder for new conversations
        if (this.initiatedConversation && this.initiatedConversation.uuid) {
          inboxGroup[this.initiatedConversation.uuid] = [{
            uuid: this.initiatedConversation.uuid,
            user: this.initiatedConversation.user,
            username: this.initiatedConversation.username,
            contributor: this.initiatedConversation.contributor,
            id: '',
            text: '',
            timestamp: new Date(),
          }];
        }
        // Create conversation objects
        const convos = [];
        for (let key in inboxGroup) {
          const recentMessage = inboxGroup[key][0];

          const convoModel = {
            key: recentMessage.uuid,
            name: recentMessage.user, // Handles case where from user sent the only message or the to user sent the only message
            username: !recentMessage.text ? recentMessage.username : recentMessage.toUserName,
            date: recentMessage.timestamp,
            lastMessageText: recentMessage.text,
            canLoadMore: true,
            page: 0,
          };

          convos.push(convoModel);
        }

        return convos;
      },
      // Separate from selectedConversation which is not computed so messages don't update automatically
      selectedConversationMessages () {
        // Vue-subscribe to changes
        const subscribeToUpdate = this.messagesLoading || this.updateConversationsCounter > -1;

        const selectedConversationKey = this.selectedConversation.key;
        const selectedConversation = this.messagesByConversation[selectedConversationKey];
        this.messages = selectedConversation || [];

        const ordered = orderBy(this.messages, [(m) => {
          return m.timestamp;
        }], ['asc']);

        if (subscribeToUpdate) {
          return ordered;
        }
      },
      filtersConversations () {
        // Vue-subscribe to changes
        const subscribeToUpdate = this.updateConversationsCounter > -1;

        const filtered = subscribeToUpdate && !this.search ?
          this.conversations :
          filter(this.conversations, (conversation) => {
            return conversation.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1;
          });

        const ordered = orderBy(filtered, [(o) => {
          return moment(o.date).toDate();
        }], ['desc']);

        return ordered;
      },
      currentLength () {
        return this.newMessage.length;
      },
      placeholderTexts () {
        if (this.user.flags.chatRevoked) {
          return {
            title: this.$t('PMPlaceholderTitleRevoked'),
            description: this.$t('chatPrivilegesRevoked'),
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
            switchDescription: this.$t('PMDisabled'),
            popoverText: this.$t('PMEnabledOptPopoverText'),
          };
        }
        return {
          switchDescription: this.$t('PMDisabled'),
          popoverText: this.$t('PMDisabledOptPopoverText'),
        };
      },
    },

    methods: {

      onModalHide () {
        // reset everything
        this.loadedConversations = [];
        this.loaded = false;
        this.initiatedConversation = null;
        this.messagesByConversation = {};
        this.selectedConversation = {};
      },
      messageRemoved (message) {
        const messages = this.messagesByConversation[this.selectedConversation.key];

        const messageIndex = messages.findIndex(msg => msg.id === message.id);
        if (messageIndex !== -1) messages.splice(messageIndex, 1);
        if (this.selectedConversationMessages.length === 0) {
          this.initiatedConversation = {
            uuid: this.selectedConversation.key,
            user: this.selectedConversation.name,
            username: this.selectedConversation.username,
            backer: this.selectedConversation.backer,
            contributor: this.selectedConversation.contributor,
          };
        }
      },
      toggleClick () {
        this.displayCreate = !this.displayCreate;
      },
      toggleOpt () {
        this.$store.dispatch('user:togglePrivateMessagesOpt');
      },
      async selectConversation (key) {
        let convoFound = this.conversations.find((conversation) => {
          return conversation.key === key;
        });

        this.selectedConversation = convoFound || {};

        if (!this.messagesByConversation[this.selectedConversation.key]) {
          await this.loadMessages();
        }

        Vue.nextTick(() => {
          if (!this.$refs.chatscroll) return;
          let chatscroll = this.$refs.chatscroll.$el;
          chatscroll.scrollTop = chatscroll.scrollHeight;
        });
      },
      sendPrivateMessage () {
        if (!this.newMessage) return;

        const messages = this.messagesByConversation[this.selectedConversation.key];

        messages.push({
          sent: true,
          text: this.newMessage,
          timestamp: new Date(),
          toUser: this.selectedConversation.name,
          toUserName: this.selectedConversation.username,
          toUserContributor: this.selectedConversation.contributor,
          toUserBacker: this.selectedConversation.backer,
          toUUID: this.selectedConversation.uuid,

          id: '-1', // will be updated once the result is back
          likes: {},
          ownerId: this.user._id,
          uuid: this.user._id,
          fromUUID: this.user._id,
          user: this.user.profile.name,
          username: this.user.auth.local.username,
          contributor: this.user.contributor,
          backer: this.user.backer,
        });

        // Remove the placeholder message
        if (this.initiatedConversation && this.initiatedConversation.uuid === this.selectedConversation.key) {
          this.loadedConversations.unshift(this.initiatedConversation);
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
          const messageToReset = messages[messages.length - 1];
          messageToReset.id = newMessage.id; // just set the id, all other infos already set
          Object.assign(messages[messages.length - 1], messageToReset);
          this.updateConversationsCounter++;
        });

        this.newMessage = '';
      },
      close () {
        this.$root.$emit('bv::hide::modal', 'messages-modal');
      },
      tierIcon (message) {
        const isNPC = Boolean(message.backer && message.backer.npc);
        if (isNPC) {
          return this.icons.tierNPC;
        }
        if (!message.contributor) return;
        return this.icons[`tier${message.contributor.level}`];
      },
      removeTags (html) {
        let tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      },
      parseMarkdown (text) {
        if (!text) return;
        return habiticaMarkdown.render(String(text));
      },
      infiniteScrollTrigger () {
        // show loading and wait until the loadMore debounced
        // or else it would trigger on every scrolling-pixel (while not loading)
        if (this.canLoadMore) {
          this.messagesLoading = true;
        }

        return this.loadMore();
      },
      loadMore () {
        this.selectedConversation.page += 1;
        return this.loadMessages();
      },
      async loadMessages () {
        this.messagesLoading = true;

        const requestUrl = `/api/v4/inbox/paged-messages?conversation=${this.selectedConversation.key}&page=${this.selectedConversation.page}`;
        const res = await axios.get(requestUrl);
        const loadedMessages = res.data.data;

        this.messagesByConversation[this.selectedConversation.key] = this.messagesByConversation[this.selectedConversation.key] || [];
        const loadedMessagesToAdd = loadedMessages
          .filter(m => this.messagesByConversation[this.selectedConversation.key].findIndex(mI => mI.id === m.id) === -1)
        ;
        this.messagesByConversation[this.selectedConversation.key].push(...loadedMessagesToAdd);

        // only show the load more Button if the max count was returned
        this.selectedConversation.canLoadMore = loadedMessages.length === 10;
        this.messagesLoading = false;
      },
    },
  };
</script>
