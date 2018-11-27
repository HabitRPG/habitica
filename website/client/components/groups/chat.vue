<template lang="pug">
  .row.chat-row
    .col-12
      h3(v-once) {{ label }}

      .row
        vue-tribute(:options="autocompleteOptions", v-on:tribute-replaced='autocompleteReplaced')
          textarea(:placeholder='placeholder',
                    v-model='newMessage',
                    ref='user-entry',
                    :class='{"user-entry": newMessage}',
                    @keydown='updateCarretPosition',
                    @keyup.ctrl.enter='sendMessageShortcut()',
                    @paste='disableMessageSendShortcut()',
                    maxlength='3000'
                  )
        span {{ currentLength }} / 3000

      .row.chat-actions
        .col-6.chat-receive-actions
          button.btn.btn-secondary.float-left.fetch(v-once, @click='fetchRecentMessages()') {{ $t('fetchRecentMessages') }}
          button.btn.btn-secondary.float-left(v-once, @click='reverseChat()') {{ $t('reverseChat') }}
        .col-6.chat-send-actions
          button.btn.btn-secondary.send-chat.float-right(v-once, @click='sendMessage()') {{ $t('send') }}

      community-guidelines

      slot(
        name="additionRow",
      )

      .row
        .hr.col-12
        chat-message(:chat.sync='group.chat', :group-type='group.type', :group-id='group._id', :group-name='group.name')
</template>

<script>
  import debounce from 'lodash/debounce';
  import VueTribute from 'vue-tribute';
  import axios from 'axios';

  import communityGuidelines from './communityGuidelines';
  import chatMessage from '../chat/chatMessages';
  import styleHelper from 'client/mixins/styleHelper';
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
    props: ['label', 'group', 'placeholder'],
    components: {
      communityGuidelines,
      chatMessage,
      VueTribute,
    },
    data () {
      return {
        newMessage: '',
        caretPosition: 0,
        chat: {
          submitDisable: false,
          submitTimeout: null,
        },
        coords: {
          TOP: 0,
          LEFT: 0,
        },
        textbox: this.$refs,
        icons: Object.freeze({
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
        autocompleteOptions: {
          async values (text, cb) {
            if (text.length > 0) {
              let suggestions = await axios.get(`/api/v4/members/find/${text}`);
              cb(suggestions.data.data);
            } else {
              cb([]);
            }
          },
          selectTemplate (item) {
            return `@${item.original.auth.local.username}`;
          },
          lookup (item) {
            return item.auth.local.username;
          },
          menuItemTemplate (item) {
            let userTierClass = styleHelper.methods.userLevelStyle(item.original);
            return `<h3 class='profile-name ${userTierClass}'> ${item.original.profile.name}</h3> @${item.string}`;
          },
        },
      };
    },
    computed: {
      currentLength () {
        return this.newMessage.length;
      },
    },
    methods: {
      // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
      getCoord (e, text) {
        this.caretPosition = text.selectionEnd;
        let div = document.createElement('div');
        let span = document.createElement('span');
        let copyStyle = getComputedStyle(text);

        [].forEach.call(copyStyle, (prop) => {
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
        let text = eventUpdate.target;
        this.getCoord(eventUpdate, text);
      },
      async sendMessageShortcut () {
        // If the user recently pasted in the text field, don't submit
        if (!this.chat.submitDisable) {
          this.sendMessage();
        }
      },
      async sendMessage () {
        let response = await this.$store.dispatch('chat:postChat', {
          group: this.group,
          message: this.newMessage,
        });
        this.group.chat.unshift(response.message);
        this.newMessage = '';

        // @TODO: I would like to not reload everytime we send. Realtime/Firebase?
        let chat = await this.$store.dispatch('chat:getChat', {groupId: this.group._id});
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

      fetchRecentMessages () {
        this.$emit('fetchRecentMessages');
      },
      reverseChat () {
        this.group.chat.reverse();
      },
      tierIcon (user) {
        const isNPC = Boolean(user.backer && user.backer.npc);
        if (isNPC) {
          return this.icons.tierNPC;
        }
        return this.icons[`tier${user.contributor.level}`];
      },
      autocompleteReplaced () {
        this.newMessage = this.$refs['user-entry'].value;
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
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/variables.scss';

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

    textarea {
      min-height: 150px;
      width: 100%;
      background-color: $white;
      border: solid 1px $gray-400;
      font-style: italic;
      line-height: 1.43;
      color: $gray-300;
      padding: .5em;
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

  .v-tribute {
    width: 100%;
  }
</style>

<style lang="scss">
  @import '~client/assets/scss/tiers.scss';
  @import '~client/assets/scss/colors.scss';

  .tribute-container {
    position: absolute;
    top: 0;
    left: 0;
    height: auto;
    max-height: 400px;
    max-width: 600px;
    overflow: auto;
    display: block;
    z-index: 999999;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(#000, 0.13);
  }
  .tribute-container ul {
    margin: 0;
    margin-top: 2px;
    padding: 0;
    list-style: none;
    background: #fff;
    border-radius: 4px;
    border: 1px solid rgba(#000, 0.13);
    background-clip: padding-box;
    overflow: hidden;
    -moz-transition: none;
    -webkit-transition: none;
    transition: none;
  }

  .tribute-container li {
    color: $gray-200;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 14px;
    -moz-transition: none;
    -webkit-transition: none;
    transition: none;
  }

  .tribute-container li.highlight,
  .tribute-container li:hover {
    background-color: rgba(213, 200, 255, 0.32);
    color: $purple-300;
  }

  .tribute-container li span {
    font-weight: bold;
  }

  .tribute-container li.no-match {
    cursor: default;
  }

  .profile-name {
    display: inline-block;
    font-size: 16px;
    margin-bottom: 0rem;
  }


  .tier-svg-icon {
    width: 10px;
    display: inline-block;
    margin-left: .5em;
  }
</style>
