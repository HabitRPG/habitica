<template>
  <div class="row chat-row">
    <div class="col-12">
      <h3
        class="float-left label"
        :class="{accepted: communityGuidelinesAccepted }"
      >
        {{ label }}
      </h3>
      <div
        v-markdown="$t('markdownFormattingHelp')"
        class="float-right"
      ></div>
      <div
        v-if="communityGuidelinesAccepted"
        class="row"
      >
        <textarea
          ref="user-entry"
          v-model="newMessage"
          dir="auto"
          :placeholder="placeholder"
          :class="{'user-entry': newMessage}"
          :maxlength="MAX_MESSAGE_LENGTH"
          @keydown="updateCarretPosition"
          @keyup.ctrl.enter="sendMessageShortcut()"
          @keydown.tab="handleTab($event)"
          @keydown.up="selectPreviousAutocomplete($event)"
          @keydown.down="selectNextAutocomplete($event)"
          @keypress.enter="selectAutocomplete($event)"
          @keydown.esc="handleEscape($event)"
          @paste="disableMessageSendShortcut()"
        ></textarea>
        <span>{{ currentLength }} / {{ MAX_MESSAGE_LENGTH }}</span>
        <autocomplete
          ref="autocomplete"
          :text="newMessage"
          :textbox="textbox"
          :coords="coords"
          :caret-position="caretPosition"
          :chat="group.chat"
          @select="selectedAutocomplete"
        />
      </div>
      <community-guidelines />
      <div class="row chat-actions">
        <div class="col-6 chat-receive-actions">
          <button
            v-once
            class="btn btn-secondary float-left fetch"
            @click="fetchRecentMessages()"
          >
            {{ $t('fetchRecentMessages') }}
          </button>
          <button
            v-once
            class="btn btn-secondary float-left"
            @click="reverseChat()"
          >
            {{ $t('reverseChat') }}
          </button>
        </div>
        <div class="col-6 chat-send-actions">
          <button
            class="btn btn-primary send-chat float-right"
            :disabled="!communityGuidelinesAccepted"
            @click="sendMessage()"
          >
            {{ $t('send') }}
          </button>
        </div>
      </div>
      <slot name="additionRow"></slot>
      <div class="row">
        <div class="hr col-12"></div>
        <chat-message
          :chat.sync="group.chat"
          :group-type="group.type"
          :group-id="group._id"
          :group-name="group.name"
        />
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';

import externalLinks from '../../mixins/externalLinks';

import autocomplete from '../chat/autoComplete';
import communityGuidelines from './communityGuidelines';
import chatMessage from '../chat/chatMessages';
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';
import { MAX_MESSAGE_LENGTH } from '@/../../common/script/constants';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
    autocomplete,
    communityGuidelines,
    chatMessage,
  },
  mixins: [externalLinks],
  props: ['label', 'group', 'placeholder'],
  data () {
    return {
      newMessage: '',
      sending: false,
      caretPosition: 0,
      chat: {
        submitDisable: false,
        submitTimeout: null,
      },
      coords: {
        TOP: 0,
        LEFT: 0,
      },
      textbox: null,
      MAX_MESSAGE_LENGTH: MAX_MESSAGE_LENGTH.toString(),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    currentLength () {
      return this.newMessage.length;
    },
    communityGuidelinesAccepted () {
      return this.user.flags.communityGuidelinesAccepted;
    },
  },
  mounted () {
    this.textbox = this.$refs['user-entry'];
    this.handleExternalLinks();
  },
  updated () {
    this.handleExternalLinks();
  },
  methods: {
    // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
    getCoord (e, text) {
      this.caretPosition = text.selectionEnd;
      const div = document.createElement('div');
      const span = document.createElement('span');
      const copyStyle = getComputedStyle(text);

      [].forEach.call(copyStyle, prop => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      document.body.appendChild(div);
      div.textContent = text.value.substr(0, this.caretPosition);
      span.textContent = text.value.substr(this.caretPosition) || '.';
      div.appendChild(span);
      this.coords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    updateCarretPosition: debounce(function updateCarretPosition (eventUpdate) {
      this._updateCarretPosition(eventUpdate);
    }, 250),
    _updateCarretPosition (eventUpdate) {
      const text = eventUpdate.target;
      this.getCoord(eventUpdate, text);
    },
    async sendMessageShortcut () {
      // If the user recently pasted in the text field, don't submit
      if (!this.chat.submitDisable) {
        this.sendMessage();
      }
    },
    async sendMessage () {
      if (this.sending) return;
      this.sending = true;
      let response;

      try {
        response = await this.$store.dispatch('chat:postChat', {
          group: this.group,
          message: this.newMessage,
        });
      } catch (e) {
        // catch exception to allow function to continue
      }

      if (response) {
        this.group.chat.unshift(response.message);
        this.newMessage = '';
      }

      this.sending = false;

      // @TODO: I would like to not reload everytime we send. Why are we reloading?
      // The response has all the necessary data...
      const chat = await this.$store.dispatch('chat:getChat', { groupId: this.group._id });
      this.group.chat = chat;
    },

    disableMessageSendShortcut () {
      // Some users were experiencing accidental sending of messages after pasting
      // So, after pasting, disable the shortcut for a second.
      this.chat.submitDisable = true;

      if (this.chat.submitTimeout) {
        // If someone pastes during the disabled period, prevent early re-enable
        clearTimeout(this.chat.submitTimeout);
        this.chat.submitTimeout = null;
      }

      this.chat.submitTimeout = window.setTimeout(() => {
        this.chat.submitTimeout = null;
        this.chat.submitDisable = false;
      }, 500);
    },

    handleTab (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        if (e.shiftKey) {
          this.$refs.autocomplete.selectPrevious();
        } else {
          this.$refs.autocomplete.selectNext();
        }
      }
    },

    handleEscape (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.cancel();
      }
    },

    selectNextAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.selectNext();
      }
    },

    selectPreviousAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.selectPrevious();
      }
    },

    selectAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        if (this.$refs.autocomplete.selected !== null) {
          e.preventDefault();
          this.$refs.autocomplete.makeSelection();
        } else {
          // no autocomplete selected, newline instead
          this.$refs.autocomplete.cancel();
        }
      }
    },

    selectedAutocomplete (newText, newCaret) {
      this.newMessage = newText;
      // Wait for v-modal to update
      this.$nextTick(() => {
        this.textbox.setSelectionRange(newCaret, newCaret);
        this.textbox.focus();
      });
    },

    fetchRecentMessages () {
      this.$emit('fetchRecentMessages');
    },
    reverseChat () {
      this.group.chat.reverse();
    },
  },
  beforeRouteUpdate (to, from, next) {
    // Reset chat
    this.newMessage = '';
    this.coords = {
      TOP: 0,
      LEFT: 0,
    };

    next();
  },
};
</script>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  .chat-actions {
    margin-top: 1em;

    .chat-receive-actions {
      padding-left: 0;

      button {
        margin-bottom: 1em;

        &:not(:last-child) {
          margin-right: 1em;
        }
      }
    }

    .chat-send-actions {
      padding-right: 0;
    }
  }

  .chat-row {
    position: relative;

    .label:not(.accepted) {
      color: #a5a1ac;
    }

    .row {
      margin-left: 0;
      margin-right: 0;
      clear: both;
    }

    textarea {
      min-height: 150px;
      width: 100%;
      background-color: $white;
      border: solid 1px $gray-400;
      font-style: italic;
      line-height: 1.43;
      color: $gray-300;
      padding: 10px 12px;
    }

    .user-entry {
      font-style: normal;
      color: $black;
    }

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
  }

</style>
