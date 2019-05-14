<template lang="pug">
  b-modal#inbox-modal(title="", :hide-footer="true", size='lg', @shown="onModalShown", @hide="onModalHide")
    .header-wrap.container.align-items-center(slot="modal-header")
      .row.align-items-center
        .col-4
          .row.align-items-center
            .col-2
              .svg-icon.envelope(v-html="icons.messageIcon")
            .col-6
              h2.text-center(v-once) {{ $t('messages') }}
        .col-4.offset-3
          toggle-switch.float-right(
            :label="optTextSet.switchDescription",
            :checked="!this.user.inbox.optOut"
            :hoverText="optTextSet.popoverText",
            @change="toggleOpt()"
          )
        .col-1
          .close
            span.svg-icon.inline.icon-10(aria-hidden="true", v-html="icons.svgClose", @click="close()")
    .row
      .col-4.sidebar
        .search-section
          b-form-input(:placeholder="$t('search')", v-model='search')
        .empty-messages.text-center(v-if='filtersConversations.length === 0')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4(v-once) {{$t('emptyMessagesLine1')}}
          p(v-if="!user.flags.chatRevoked") {{$t('emptyMessagesLine2')}}
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
      .col-8.messages.d-flex.flex-column.justify-content-between
        .empty-messages.text-center(v-if='!selectedConversation.key')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4 {{placeholderTexts.title}}
          p(v-html="placeholderTexts.description")
        .empty-messages.text-center(v-if='selectedConversation && selectedConversationMessages.length === 0')
          p {{ $t('beginningOfConversation', {userName: selectedConversation.name})}}
        chat-messages.message-scroll(
          v-if="selectedConversation && selectedConversationMessages.length > 0",
          :chat='selectedConversationMessages',
          :inbox='true',
          @message-removed='messageRemoved',
          ref="chatscroll",

          :canLoadMore="canLoadMore",
          :isLoading="messagesLoading",
          @triggerLoad="infiniteScrollTrigger"
        )
        .pm-disabled-caption.text-center(v-if="user.inbox.optOut && selectedConversation.key")
          h4 {{$t('PMDisabledCaptionTitle')}}
          p {{$t('PMDisabledCaptionText')}}
        .new-message-row(v-if='selectedConversation.key && !user.flags.chatRevoked')
          textarea(
            v-model='newMessage',
            @keyup.ctrl.enter='sendPrivateMessage()',
            maxlength='3000'
          )
          button.btn.btn-secondary(@click='sendPrivateMessage()') {{$t('send')}}
          .row
            span.ml-3 {{ currentLength }} / 3000
</template>

<style lang="scss">
  #inbox-modal .modal-body {
    padding-top: 0px;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/tiers.scss';

  .header-wrap {
    padding: 0.5em;

    h2 {
      margin: 0;
      line-height: 1;
    }
  }

  h3 {
    margin: 0rem;

    .svg-icon {
      width: 10px;
      display: inline-block;
      margin-left: .5em;
    }
  }

  .envelope {
    color: $gray-400 !important;
    margin: 0;
  }

  .sidebar {
    background-color: $gray-700;
    min-height: 540px;
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
    height: 540px;
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
  }

  .conversation.active {
    border: 1px solid $purple-400;
  }

  .conversation:hover {
    cursor: pointer;
  }

  .time {
    font-size: 12px;
    color: $gray-200;
    margin-bottom: 0.5rem;
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

import chatMessages from '../chat/chatMessages';
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

export default {
  mixins: [styleHelper],
  components: {
    chatMessages,
    toggleSwitch,
  },
  mounted () {
    this.$root.$on('habitica::new-inbox-message', (data) => {
      this.$root.$emit('bv::show::modal', 'inbox-modal');

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
  },
  destroyed () {
    this.$root.$off('habitica::new-inbox-message');
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
      canLoadMore: true,
      page: 0,
      initiatedConversation: null,
      updateConversionsCounter: 0,
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
          key: recentMessage.toUUID ? recentMessage.toUUID : recentMessage.uuid,
          name: recentMessage.toUser ? recentMessage.toUser : recentMessage.user, // Handles case where from user sent the only message or the to user sent the only message
          username: !recentMessage.text ? recentMessage.username : recentMessage.toUserName,
          date: recentMessage.timestamp,
          lastMessageText: recentMessage.text,
        };

        convos.push(convoModel);
      }

      return convos;
    },
    // Separate from selectedConversation which is not computed so messages don't update automatically
    selectedConversationMessages () {
      // Vue-subscribe to changes
      const subScribeToUpdate = this.messagesLoading || true;

      const selectedConversationKey = this.selectedConversation.key;
      const selectedConversation = this.messagesByConversation[selectedConversationKey];
      this.messages = selectedConversation || [];

      const ordered = orderBy(this.messages, [(m) => {
        return m.timestamp;
      }], ['asc']);

      if (subScribeToUpdate) {
        return ordered;
      }
    },
    filtersConversations () {
      // Vue-subscribe to changes
      const subScribeToUpdate = this.updateConversionsCounter > -1;

      const filtered = subScribeToUpdate && !this.search ?
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

      const conversationRes = await axios.get('/api/v4/inbox/conversations');
      this.loadedConversations = conversationRes.data.data;

      this.loaded = true;
    },
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
      this.page = 0;

      if (!this.messagesByConversation[this.selectedConversation.key]) {
        await this.loadMessages();
      }

      Vue.nextTick(() => {
        if (!this.$refs.chatscroll) return;
        let chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
    mapMessage (message) {
      let newChat = Object.assign({}, message);
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
    },
    sendPrivateMessage () {
      if (!this.newMessage) return;

      const messages = this.messagesByConversation[this.selectedConversation.key];

      messages.push(this.mapMessage({
        sent: true,
        text: this.newMessage,
        timestamp: new Date(),
        user: this.selectedConversation.name,
        username: this.selectedConversation.username,
        uuid: this.selectedConversation.key,
        contributor: this.user.contributor,
      }));

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
        Object.assign(messages[messages.length - 1], this.mapMessage(newMessage));
        this.updateConversionsCounter++;
      });

      this.newMessage = '';
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'inbox-modal');
    },
    tierIcon (message) {
      const isNPC = Boolean(message.backer && message.backer.npc);
      if (isNPC) {
        return this.icons.tierNPC;
      }
      if (!message.contributor) return;
      return this.icons[`tier${message.contributor.level}`];
    },
    infiniteScrollTrigger () {
      // show loading and wait until the loadMore debounced
      // or else it would trigger on every scrolling-pixel (while not loading)
      if (this.canLoadMore) {
        this.messagesLoading = true;
      }

      this.loadMore();
    },
    loadMore () {
      this.page += 1;
      this.loadMessages();
    },
    async loadMessages () {
      this.messagesLoading = true;

      const requestUrl = `/api/v4/inbox/messages?conversation=${this.selectedConversation.key}&page=${this.page}`;
      const res = await axios.get(requestUrl);
      const loadedMessages = res.data.data.map(this.mapMessage);

      this.messagesByConversation[this.selectedConversation.key] = this.messagesByConversation[this.selectedConversation.key] || [];
      this.messagesByConversation[this.selectedConversation.key].push(...loadedMessages);

      // only show the load more Button if the max count was returned
      this.canLoadMore = loadedMessages.length === 10;
      this.messagesLoading = false;
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
  },
};
</script>
