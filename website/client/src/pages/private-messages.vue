<template>
  <div id="private-message">
    <div class="floating-header-shadow"></div>
    <div class="header-bar d-flex w-100">
      <!-- changing w-25 would also need changes in .left-header.w-25 -->
      <div class="d-flex left-header">
        <div
          v-once
          class="mail-icon svg-icon"
          v-html="icons.mail"
        ></div>
        <h2
          v-once
          class="flex-fill text-center mail-icon-label"
        >
          {{ $t('messages') }}
        </h2>
        <div class="placeholder svg-icon">
          <!-- placeholder -->
        </div>
      </div>
      <div
        v-if="selectedConversation && selectedConversation.key"
        class="d-flex selected-conversion"
      >
        <router-link
          :to="{'name': 'userProfile', 'params': {'userId': selectedConversation.key}}"
        >
          <face-avatar
            v-if="selectedConversation.userStyles"
            :member="selectedConversation.userStyles"
            :class="selectedConversationFaceAvatarClass"
          />
        </router-link>
        <user-link
          :backer="selectedConversation.backer"
          :contributor="selectedConversation.contributor"
          :name="selectedConversation.name"
          :user="selectedConversation"
          :user-id="selectedConversation.key"
          :hide-tooltip="true"
        />
      </div>
    </div>
    <div class="d-flex content">
      <div class="sidebar d-flex flex-column">
        <div class="disable-background">
          <toggle-switch
            :label="optTextSet.switchDescription"
            :checked="this.user.inbox.optOut"
            :hover-text="optTextSet.popoverText"
            @change="toggleOpt()"
          />
        </div>
        <div
          v-if="filtersConversations.length > 0"
          class="conversations"
        >
          <conversation-item
            v-for="conversation in filtersConversations"
            :key="conversation.key"
            :active-key="selectedConversation.key"
            :contributor="conversation.contributor"
            :backer="conversation.backer"
            :uuid="conversation.key"
            :display-name="conversation.name"
            :username="conversation.username"
            :last-message-date="conversation.date"
            :last-message-text="conversation.lastMessageText
              ? removeTags(parseMarkdown(conversation.lastMessageText)) : ''"
            @click="selectConversation(conversation.key)"
          />
        </div>
        <button
          v-if="canLoadMoreConversations"
          class="btn btn-secondary"
          @click="loadConversations()"
        >
          {{ $t('loadMore') }}
        </button>
      </div>
      <div class="messages-column d-flex flex-column align-items-center">
        <div
          v-if="filtersConversations.length === 0
            && (!selectedConversation || !selectedConversation.key)"
          class="empty-messages m-auto text-center empty-sidebar"
        >
          <div class="no-messages-box">
            <div
              v-once
              class="svg-icon envelope"
              v-html="icons.messageIcon"
            ></div>
            <h2 v-once>
              {{ $t('emptyMessagesLine1') }}
            </h2>
            <p v-if="!user.flags.chatRevoked">
              {{ $t('emptyMessagesLine2') }}
            </p>
          </div>
        </div>
        <div
          v-if="filtersConversations.length !== 0 && !selectedConversation.key"
          class="empty-messages full-height m-auto text-center"
        >
          <div class="no-messages-box">
            <div
              v-once
              class="svg-icon envelope"
              v-html="icons.messageIcon"
            ></div>
            <h2>{{ placeholderTexts.title }}</h2>
            <p v-html="placeholderTexts.description"></p>
          </div>
        </div>
        <div
          v-if="selectedConversation.key && selectedConversationMessages.length === 0"
          class="empty-messages full-height mt-auto text-center"
        >
          <avatar
            v-if="selectedConversation.userStyles"
            :member="selectedConversation.userStyles"
            :avatar-only="true"
            sprites-margin="0 0 0 -45px"
            class="center-avatar"
          />
          <h3>{{ $t('beginningOfConversation', {userName: selectedConversation.name}) }}</h3>
          <p>{{ $t('beginningOfConversationReminder') }}</p>
        </div>
        <messageList
          v-if="selectedConversation && selectedConversationMessages.length > 0"
          ref="chatscroll"
          class="message-scroll"
          :chat="selectedConversationMessages"
          :conversation-opponent-user="selectedConversation.userStyles"
          :can-load-more="canLoadMore"
          :is-loading="messagesLoading"
          @message-removed="messageRemoved"
          @triggerLoad="infiniteScrollTrigger"
        />
        <div
          v-if="disabledTexts"
          class="pm-disabled-caption text-center"
        >
          <h4>{{ disabledTexts.title }}</h4>
          <p>{{ disabledTexts.description }}</p>
        </div>
        <div class="full-width">
          <div
            class="new-message-row d-flex align-items-center"
          >
            <textarea
              ref="textarea"
              v-model="newMessage"
              dir="auto"
              class="flex-fill"
              :placeholder="$t('needsTextPlaceholder')"
              :maxlength="MAX_MESSAGE_LENGTH"
              :class="{'has-content': newMessage.trim() !== '', 'disabled': newMessageDisabled}"
              @keyup.ctrl.enter="sendPrivateMessage()"
            >
            </textarea>
          </div>
          <div
            class="sub-new-message-row d-flex"
          >
            <div
              v-once
              class="guidelines flex-fill"
              v-html="$t('communityGuidelinesIntro')"
            ></div>
            <button
              class="btn btn-primary"
              :class="{'disabled':newMessageDisabled || newMessage === ''}"
              @click="sendPrivateMessage()"
            >
              {{ $t('send') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  $pmHeaderHeight: 56px;

  // Content of Private Message should be always full-size (minus the toolbar/resting banner)

  #private-message {
    height: calc(100vh - #{$menuToolbarHeight} -
      var(--banner-gift-promo-height, 0px) -
      var(--banner-damage-paused-height, 0px) -
      var(--banner-gems-promo-height, 0px)
    ); // css variable magic :), must be 0px, 0 alone won't work

    .content {
      flex: 1;
      height: calc(100vh - #{$menuToolbarHeight} - #{$pmHeaderHeight} -
        var(--banner-gift-promo-height, 0px) -
        var(--banner-damage-paused-height, 0px) -
        var(--banner-gems-promo-height, 0px)
      );
    }

    .disable-background {
      .toggle-switch-description {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        flex: 1;
      }

      .toggle-switch-outer {
        display: flex;
      }

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

    .toggle-switch-description {
      font-size: 14px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: normal;
      color: $gray-50;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/tiers.scss';
  @import '~@/assets/scss/variables.scss';

  $pmHeaderHeight: 56px;
  $background: $white;

  .header-bar {
    height: 56px;
    background-color: $white;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    align-items: center;

    .mail-icon {
      width: 32px;
      height: 24px;
      object-fit: contain;
    }

    .mail-icon-label {
      margin-bottom: 0;
    }

    .placeholder.svg-icon {
      width: 32px;
    }
  }

  .full-height {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .user-link {
    margin-left: 12px;
  }

  .selected-conversion {
    justify-content: center;
    align-items: center;
  }

  #private-message {
    background-color: $background;
    position: relative;
  }

  .disable-background {
    height: 44px;
    background-color: $gray-600;
    padding: 0.75rem 1.5rem;

    border-bottom: 1px solid $gray-500;
  }

  .conversations {
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
  }

  .empty-messages {
    h3, p {
      color: $gray-200;
      margin: 0rem;
    }

    h2 {
      color: $gray-200;
      margin-bottom: 1rem;
    }

    p {
      font-size: 12px;
    }

    .no-messages-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 330px;
    }

    .envelope {
      color: $gray-400 !important;
      margin-bottom: 1.5rem;

      ::v-deep svg {
        width: 64px;
        height: 48px;
      }
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

  .header-wrap {
    padding: 0.5em;

    h2 {
      margin: 0;
      line-height: 1;
    }
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

  .selected-conversion {
    flex: 1;
  }

  .messages-column {
    flex: 1;
    padding: 0rem;
    display: flex;
    flex-direction: column;

    .empty-messages, .message-scroll {
      flex: 1;
    }
  }

  .message-scroll {
    overflow-x: hidden;
    padding-top: 0.5rem;

    @media (min-width: 992px) {
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }

  .full-width {
    width: 100%;
  }

  .new-message-row {
    width: 100%;
    padding-left: 1.5rem;
    padding-top: 1.5rem;
    padding-right: 1.5rem;

    textarea {
      background: $white;
      display: inline-block;
      vertical-align: bottom;
      border-radius: 2px;
      z-index: 5;

      &.disabled {
        pointer-events: none;
        opacity: 0.64;
        background-color: $gray-500;
      }

      &.has-content {
        --textarea-auto-height: 80px;
      }

      height: var(--textarea-auto-height, 40px);
      min-height: var(--textarea-auto-height, 40px);
      max-height: 300px;
    }
  }

  .sub-new-message-row {
    padding: 1.5rem;

    .guidelines {
      height: 32px;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: normal;
      color: $gray-200;
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }

    button {
      height: 40px;
      border-radius: 2px;
      margin-left: 1.5rem;

      &.disabled {
        cursor: default;
        pointer-events: none;
        opacity: 0.64;
        background-color: $gray-500;
        color: $gray-100;
      }
    }
  }

  .pm-disabled-caption {
    padding-top: 1em;
    z-index: 2;

    h4, p {
      color: $gray-200;
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

  .left-header {
    max-width: calc(330px - 2rem); // minus the left padding
    flex: 1;
  }

  .sidebar {
    width: 330px;
    background-color: $gray-700;
    padding: 0;
    border-bottom-left-radius: 8px;

    @media only screen and (max-width: 768px) {
      width: 280px;
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

  .empty-sidebar {
    display: flex;
    align-items: center;
  }

  .floating-message-input {
    background: $background;
    position: fixed;
    bottom: 0;
  }

  .floating-header-shadow {
    position: absolute;
    top: 0;
    width: 100%;
    height: 56px;
    right: 0;
    z-index: 1;
    pointer-events: none;

    box-shadow: 0 3px 12px 0 rgba(26, 24, 29, 0.24);
  }

  .center-avatar {
    margin: 0 auto;
  }
</style>

<script>
import Vue from 'vue';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import habiticaMarkdown from 'habitica-markdown';
import axios from 'axios';
import { MAX_MESSAGE_LENGTH } from '@/../../common/script/constants';
import { mapState } from '@/libs/store';
import styleHelper from '@/mixins/styleHelper';
import toggleSwitch from '@/components/ui/toggleSwitch';
import userLink from '@/components/userLink';

import messageList from '@/components/messages/messageList';
import messageIcon from '@/assets/svg/message.svg';
import mail from '@/assets/svg/mail.svg';
import conversationItem from '@/components/messages/conversationItem';
import faceAvatar from '@/components/faceAvatar';
import Avatar from '@/components/avatar';
import { EVENTS } from '@/libs/events';

// extract to a shared path
const CONVERSATIONS_PER_PAGE = 10;
const PM_PER_PAGE = 10;

export default {
  components: {
    Avatar,
    messageList,
    toggleSwitch,
    conversationItem,
    userLink,
    faceAvatar,
  },
  filters: {
    timeAgo (value) {
      return moment(new Date(value)).fromNow();
    },
  },
  mixins: [styleHelper],
  data () {
    return {
      icons: Object.freeze({
        messageIcon,
        mail,
      }),
      loaded: false,
      showPopover: false,

      /* Conversation-specific data */
      initiatedConversation: null,
      updateConversationsCounter: 0,
      selectedConversation: {},
      conversationPage: 0,
      canLoadMoreConversations: false,
      loadedConversations: [],
      messagesByConversation: {}, // cache {uuid: []}

      newMessage: '',
      messages: [],
      messagesLoading: false,
      MAX_MESSAGE_LENGTH: MAX_MESSAGE_LENGTH.toString(),
    };
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      const data = vm.$store.state.privateMessageOptions;

      if ((!data || (data && !data.userIdToMessage)) && vm.$route.query && vm.$route.query.uuid) {
        vm.$store.dispatch('user:userLookup', { uuid: vm.$route.query.uuid }).then(res => {
          if (res && res.data && res.data.data) {
            vm.$store.dispatch('user:newPrivateMessageTo', {
              member: res.data.data,
            });
          }
        });
      } else {
        vm.hasPrivateMessageOptionsOnPageLoad = true;
      }
    });
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
          backer: this.initiatedConversation.backer,
          userStyles: this.initiatedConversation.userStyles,
          id: '',
          text: '',
          timestamp: new Date(),
          canReceive: true,
        }];
      }
      // Create conversation objects
      const convos = [];
      for (const key in inboxGroup) {
        if (Object.prototype.hasOwnProperty.call(inboxGroup, key)) {
          const recentMessage = inboxGroup[key][0];

          const convoModel = {
            key: recentMessage.uuid,
            name: recentMessage.user,
            // Handles case where from user sent the only message
            // or the to user sent the only message
            username: recentMessage.username,
            date: recentMessage.timestamp,
            lastMessageText: recentMessage.text,
            contributor: recentMessage.contributor,
            userStyles: recentMessage.userStyles,
            backer: recentMessage.backer,
            canReceive: recentMessage.canReceive,
            canLoadMore: false,
            page: 0,
          };

          convos.push(convoModel);
        }
      }

      return convos;
    },
    // Separate from selectedConversation which is not computed
    // so messages don't update automatically
    /* eslint-disable vue/no-side-effects-in-computed-properties */
    selectedConversationMessages () {
      // Vue-subscribe to changes
      const subscribeToUpdate = this.messagesLoading || this.updateConversationsCounter > -1;

      const selectedConversationKey = this.selectedConversation.key;
      const selectedConversation = this.messagesByConversation[selectedConversationKey];
      this.messages = selectedConversation || [];

      const ordered = orderBy(this.messages, [m => m.timestamp], ['asc']);

      if (subscribeToUpdate) {
        return ordered;
      }

      return [];
    },
    filtersConversations () {
      // Vue-subscribe to changes
      const subscribeToUpdate = this.updateConversationsCounter > -1;

      const filtered = subscribeToUpdate && this.conversations;

      const ordered = orderBy(filtered, [o => o.date], ['desc']);

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
    disabledTexts () {
      if (this.user.flags.chatRevoked) {
        return {
          title: this.$t('PMPlaceholderTitleRevoked'),
          description: this.$t('chatPrivilegesRevoked'),
        };
      }

      if (this.user.inbox.optOut) {
        return {
          title: this.$t('PMDisabledCaptionTitle'),
          description: this.$t('PMDisabledCaptionText'),
        };
      }

      if (this.selectedConversation?.key) {
        if (this.user.inbox.blocks.includes(this.selectedConversation.key)) {
          return {
            title: this.$t('PMDisabledCaptionTitle'),
            description: this.$t('PMUnblockUserToSendMessages'),
          };
        }

        if (!this.selectedConversation.canReceive) {
          return {
            title: this.$t('PMCanNotReply'),
            description: this.$t('PMUserDoesNotReceiveMessages'),
          };
        }
      }

      return null;
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
    selectedConversationFaceAvatarClass () {
      if (this.selectedConversation?.contributor) {
        return `tier${this.selectedConversation.contributor.level}`;
      }
      return '';
    },
    newMessageDisabled () {
      return !this.selectedConversation || !this.selectedConversation.key
        || this.disabledTexts !== null;
    },
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('messages'),
    });
    // notification click to refresh
    this.$root.$on(EVENTS.PM_REFRESH, async () => {
      await this.reload();

      this.selectFirstConversation();
    });

    // header sync button
    this.$root.$on(EVENTS.RESYNC_COMPLETED, async () => {
      await this.reload();

      this.selectFirstConversation();
    });

    await this.reload();

    // close modal if the Private Messages page is opened in an existing tab
    this.$root.$emit('bv::hide::modal', 'profile');
    this.$root.$emit('bv::hide::modal', 'members-modal');

    const data = this.$store.state.privateMessageOptions;
    if (data && data.userIdToMessage) {
      this.initiatedConversation = {
        uuid: data.userIdToMessage,
        user: data.displayName,
        username: data.username,
        backer: data.backer,
        contributor: data.contributor,
        userStyles: data.userStyles,
        canReceive: true,
      };

      this.$store.state.privateMessageOptions = {};

      this.selectConversation(this.initiatedConversation.uuid);
    }
  },
  beforeDestroy () {
    this.$root.$off(EVENTS.RESYNC_COMPLETED);
    this.$root.$off(EVENTS.PM_REFRESH);
  },

  methods: {
    async reload () {
      this.loaded = false;
      this.conversationPage = 0;

      this.loadedConversations = [];
      this.selectedConversation = {};

      await this.loadConversations();

      await this.$store.dispatch('user:markPrivMessagesRead');

      this.loaded = true;
    },
    async loadConversations () {
      const query = ['/api/v4/inbox/conversations'];
      query.push(`?page=${this.conversationPage}`);
      this.conversationPage += 1;

      const conversationRes = await axios.get(query.join(''));
      const loadedConversations = conversationRes.data.data;
      this.canLoadMoreConversations = loadedConversations.length === CONVERSATIONS_PER_PAGE;
      this.loadedConversations.push(...loadedConversations);
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
    toggleOpt () {
      this.$store.dispatch('user:togglePrivateMessagesOpt');
    },
    async selectConversation (key, forceLoadMessage = false) {
      const convoFound = this.conversations.find(conversation => conversation.key === key);

      this.selectedConversation = convoFound || {};

      if (!this.messagesByConversation[this.selectedConversation.key] || forceLoadMessage) {
        await this.loadMessages();
      }

      this.scrollToBottom();
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
        canReceive: true,
      });

      // Remove the placeholder message
      if (this.initiatedConversation
        && this.initiatedConversation.uuid === this.selectedConversation.key) {
        this.loadedConversations.unshift(this.initiatedConversation);
        this.initiatedConversation = null;
      }

      this.selectedConversation.lastMessageText = this.newMessage;
      this.selectedConversation.date = new Date();

      this.scrollToBottom();

      this.$store.dispatch('members:sendPrivateMessage', {
        toUserId: this.selectedConversation.key,
        message: this.newMessage,
      }).then(response => {
        const newMessage = response.data.data.message;
        const messageToReset = messages[messages.length - 1];
        messageToReset.id = newMessage.id; // just set the id, all other infos already set
        messageToReset.text = newMessage.text; // handle mentions
        Object.assign(messages[messages.length - 1], messageToReset);
        this.updateConversationsCounter += 1;
      });

      this.newMessage = '';
    },
    scrollToBottom () {
      Vue.nextTick(() => {
        if (!this.$refs.chatscroll) return;
        const chatscroll = this.$refs.chatscroll.$el;
        chatscroll.scrollTop = chatscroll.scrollHeight;
      });
    },
    removeTags (html) {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    },
    parseMarkdown (text) {
      if (!text) return null;
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

      // use local vars if the loading takes longer
      // and the user switches the conversation while loading
      const conversationKey = this.selectedConversation.key;

      const requestUrl = `/api/v4/inbox/paged-messages?conversation=${conversationKey}&page=${this.selectedConversation.page}`;
      const res = await axios.get(requestUrl);
      const loadedMessages = res.data.data;

      /* eslint-disable max-len */
      this.messagesByConversation[conversationKey] = this.messagesByConversation[conversationKey] || [];
      /* eslint-disable max-len */
      const loadedMessagesToAdd = loadedMessages
        .filter(m => this.messagesByConversation[conversationKey].findIndex(mI => mI.id === m.id) === -1);
      this.messagesByConversation[conversationKey].push(...loadedMessagesToAdd);

      // only show the load more Button if the max count was returned
      this.selectedConversation.canLoadMore = loadedMessages.length === PM_PER_PAGE;
      this.messagesLoading = false;
    },
    selectFirstConversation () {
      if (this.loadedConversations.length > 0) {
        this.selectConversation(this.loadedConversations[0].uuid, true);
      }
    },
  },
};
</script>
