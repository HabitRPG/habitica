<template lang="pug">
.container
  .row
    .col-12
      copy-as-todo-modal(:group-name='groupName', :group-id='groupId')
      report-flag-modal
  div(v-for="(msg, index) in messages", v-if='chat && canViewFlag(msg)')
    // @TODO: is there a different way to do these conditionals? This creates an infinite loop
    //.hr(v-if='displayDivider(msg)')
      .hr-middle(v-once) {{ msg.timestamp }}
    .row(v-if='user._id !== msg.uuid')
      div(:class='inbox ? "col-4" : "col-2"')
        avatar(
          v-if='cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected',
          :member="cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :hideClassBadge='true',
          @click.native="showMemberModal(msg.uuid)",
        )
      .card(:class='inbox ? "col-8" : "col-10"')
        chat-card(
          :msg='msg',
          :inbox='inbox',
          :groupId='groupId',
          @messaged-liked='messageLiked',
          @message-removed='messageRemoved',
          @show-member-modal='showMemberModal')
    .row(v-if='user._id === msg.uuid')
      .card(:class='inbox ? "col-8" : "col-10"')
        chat-card(
          :msg='msg',
          :inbox='inbox',
          :groupId='groupId',
          @messaged-liked='messageLiked',
          @message-removed='messageRemoved',
          @show-member-modal='showMemberModal')
      div(:class='inbox ? "col-4" : "col-2"')
        avatar(
          v-if='cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected',
          :member="cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :hideClassBadge='true',
          @click.native="showMemberModal(msg.uuid)",
        )
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
    margin-bottom: .5em;
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
import reportFlagModal from './reportFlagModal';
import chatCard from './chatCard';

export default {
  props: ['chat', 'groupId', 'groupName', 'inbox'],
  components: {
    copyAsTodoModal,
    reportFlagModal,
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
      return this.chat;
    },
  },
  watch: {
    messages (oldValue, newValue) {
      if (newValue.length === oldValue.length) return;
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
      let promises = [];

      // @TODO: write an explination
      if (screenPosition && Math.floor(screenPosition) + 1 > this.currentProfileLoadedEnd / 10) {
        this.currentProfileLoadedEnd = 10 * (Math.floor(screenPosition) + 1);
      } else if (screenPosition) {
        return;
      }

      let aboutToCache = {};
      this.messages.forEach(message => {
        let uuid = message.uuid;
        if (Boolean(uuid) && !this.cachedProfileData[uuid] && !aboutToCache[uuid]) {
          if (uuid === 'system' || this.currentProfileLoadedCount === this.currentProfileLoadedEnd) return;
          aboutToCache[uuid] = {};
          promises.push(axios.get(`/api/v3/members/${uuid}`));
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
    },
    displayDivider (message) {
      if (this.currentDayDividerDisplay !== moment(message.timestamp).day()) {
        this.currentDayDividerDisplay = moment(message.timestamp).day();
        return true;
      }

      return false;
    },
    showMemberModal (memberId) {
      const profile = this.cachedProfileData[memberId];

      // Open the modal only if the data is available
      if (profile && !profile.rejected) {
        this.$root.$emit('habitica:show-profile', {
          user: profile,
          startingPage: 'profile',
        });
      }
    },
    messageLiked (message) {
      const chatIndex = findIndex(this.chat, chatMessage => {
        return chatMessage.id === message.id;
      });
      this.chat.splice(chatIndex, 1, message);
    },
    messageRemoved (message) {
      const chatIndex = findIndex(this.chat, chatMessage => {
        return chatMessage.id === message.id;
      });
      this.chat.splice(chatIndex, 1);
    },
  },
};
</script>
