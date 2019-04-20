<template lang="pug">
.container-fluid
  .row
    .col-12
      copy-as-todo-modal(:group-type='groupType', :group-name='groupName', :group-id='groupId')
  div(v-for="(msg, index) in messages", v-if='chat && canViewFlag(msg)', :class='{row: inbox}')
    .d-flex(v-if='user._id !== msg.uuid', :class='{"flex-grow-1": inbox}')
      avatar.avatar-left(
        v-if='msg.userStyles || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)',
        :member="msg.userStyles || cachedProfileData[msg.uuid]",
        :avatarOnly="true",
        :overrideTopPadding='"14px"',
        :hideClassBadge='true',
        @click.native="showMemberModal(msg.uuid)",
        :class='{"inbox-avatar-left": inbox}'
      )
      .card(:class='{"col-10": inbox}')
        chat-card(
          :msg='msg',
          :inbox='inbox',
          :groupId='groupId',
          @message-liked='messageLiked',
          @message-removed='messageRemoved',
          @show-member-modal='showMemberModal')
    .d-flex(v-if='user._id === msg.uuid', :class='{"flex-grow-1": inbox}')
      .card(:class='{"col-10": inbox}')
        chat-card(
          :msg='msg',
          :inbox='inbox',
          :groupId='groupId',
          @message-liked='messageLiked',
          @message-removed='messageRemoved',
          @show-member-modal='showMemberModal')
      avatar(
        v-if='msg.userStyles || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)',
        :member="msg.userStyles || cachedProfileData[msg.uuid]",
        :avatarOnly="true",
        :hideClassBadge='true',
        :overrideTopPadding='"14px"',
        @click.native="showMemberModal(msg.uuid)",
        :class='{"inbox-avatar-right": inbox}'
      )
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .avatar {
    width: 10%;
    min-width: 7rem;
  }

  .avatar-left {
    margin-left: -1.5rem;
    margin-right: 2rem;
  }

  .inbox-avatar-left {
    margin-left: -1rem;
    margin-right: 2.5rem;
    min-width: 5rem;
  }

  .inbox-avatar-right {
    margin-left: -3.5rem;
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

  .card {
    border: 0px;
    margin-bottom: .5em;
    padding: 0rem;
    width: 90%;
  }

  .message-scroll .d-flex {
    min-width: 1px;
  }
</style>

<script>
import moment from 'moment';
import axios from 'axios';
import { mapState } from 'client/libs/store';
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex';

import Avatar from '../avatar';
import copyAsTodoModal from './copyAsTodoModal';
import chatCard from './chatCard';

export default {
  props: {
    chat: {},
    inbox: {
      type: Boolean,
      default: false,
    },
    groupType: {},
    groupId: {},
    groupName: {},
  },
  components: {
    copyAsTodoModal,
    chatCard,
    Avatar,
  },
  mounted () {
    this.loadProfileCache();
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  data () {
    return {
      currentDayDividerDisplay: moment().day(),
      cachedProfileData: {},
      currentProfileLoadedCount: 0,
      currentProfileLoadedEnd: 10,
      loading: false,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    // @TODO: We need a different lazy load mechnism.
    // But honestly, adding a paging route to chat would solve this
    messages () {
      this.loadProfileCache();
      return this.chat;
    },
  },
  watch: {
    messages () {
      this.loadProfileCache();
    },
  },
  methods: {
    handleScroll () {
      this.loadProfileCache(window.scrollY / 1000);
    },
    canViewFlag (message) {
      if (message.uuid === this.user._id) return true;
      if (!message.flagCount || message.flagCount < 2) return true;
      return this.user.contributor.admin;
    },
    loadProfileCache: debounce(function loadProfileCache (screenPosition) {
      this._loadProfileCache(screenPosition);
    }, 1000),
    async _loadProfileCache (screenPosition) {
      if (this.loading) return;
      this.loading = true;

      let promises = [];
      const noProfilesLoaded = Object.keys(this.cachedProfileData).length === 0;

      // @TODO: write an explination
      // @TODO: Remove this after enough messages are cached
      if (!noProfilesLoaded && screenPosition && Math.floor(screenPosition) + 1 > this.currentProfileLoadedEnd / 10) {
        this.currentProfileLoadedEnd = 10 * (Math.floor(screenPosition) + 1);
      } else if (!noProfilesLoaded && screenPosition) {
        return;
      }

      let aboutToCache = {};
      this.messages.forEach(message => {
        let uuid = message.uuid;

        if (message.userStyles) {
          this.$set(this.cachedProfileData, uuid, message.userStyles);
        }

        if (Boolean(uuid) && !this.cachedProfileData[uuid] && !aboutToCache[uuid]) {
          if (uuid === 'system' || this.currentProfileLoadedCount === this.currentProfileLoadedEnd) return;
          aboutToCache[uuid] = {};
          promises.push(axios.get(`/api/v4/members/${uuid}`));
          this.currentProfileLoadedCount += 1;
        }
      });

      let results = await Promise.all(promises);
      results.forEach(result => {
        // We could not load the user. Maybe they were deleted. So, let's cache empty so we don't try again
        if (!result || !result.data || result.status >= 400) {
          return;
        }

        let userData = result.data.data;
        this.$set(this.cachedProfileData, userData._id, userData);
      });

      // Merge in any attempts that were rejected so we don't attempt again
      for (let uuid in aboutToCache) {
        if (!this.cachedProfileData[uuid]) {
          this.$set(this.cachedProfileData, uuid, {rejected: true});
        }
      }

      this.loading = false;
    },
    displayDivider (message) {
      if (this.currentDayDividerDisplay !== moment(message.timestamp).day()) {
        this.currentDayDividerDisplay = moment(message.timestamp).day();
        return true;
      }

      return false;
    },
    async showMemberModal (memberId) {
      let profile = this.cachedProfileData[memberId];

      if (!profile._id) {
        const result = await this.$store.dispatch('members:fetchMember', { memberId });
        if (result.response && result.response.status === 404) {
          return this.$store.dispatch('snackbars:add', {
            title: 'Habitica',
            text: this.$t('messageDeletedUser'),
            type: 'error',
            timeout: false,
          });
        } else {
          this.cachedProfileData[memberId] = result.data.data;
          profile = result.data.data;
        }
      }

      // Open the modal only if the data is available
      if (profile && !profile.rejected) {
        this.$router.push({name: 'userProfile', params: {userId: profile._id}});
      }
    },
    messageLiked (message) {
      const chatIndex = findIndex(this.chat, chatMessage => {
        return chatMessage.id === message.id;
      });
      this.chat.splice(chatIndex, 1, message);
    },
    messageRemoved (message) {
      if (this.inbox) {
        this.$emit('message-removed', message);
        return;
      }

      const chatIndex = findIndex(this.chat, chatMessage => {
        return chatMessage.id === message.id;
      });
      this.chat.splice(chatIndex, 1);
    },
  },
};
</script>
