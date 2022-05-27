<template>
  <div
    ref="container"
    class="container-fluid"
  >
    <div class="row">
      <div class="col-12">
        <copy-as-todo-modal
          :group-type="groupType"
          :group-name="groupName"
          :group-id="groupId"
        />
      </div>
    </div>
    <div class="row loadmore">
      <div v-if="canLoadMore">
        <div class="loadmore-divider"></div>
        <button
          class="btn btn-secondary"
          @click="triggerLoad()"
        >
          {{ $t('loadEarlierMessages') }}
        </button>
        <div class="loadmore-divider"></div>
      </div>
      <h2
        v-show="isLoading"
        class="col-12 loading"
      >
        {{ $t('loading') }}
      </h2>
    </div>
    <div
      v-for="msg in messages.filter(m => chat && canViewFlag(m))"
      :key="msg.id"
    >
      <div class="d-flex">
        <avatar
          v-if="user._id !== msg.uuid && msg.uuid !== 'system'"
          class="avatar-left"
          :class="{ invisible: avatarUnavailable(msg) }"
          :member="msg.userStyles || cachedProfileData[msg.uuid]"
          :avatar-only="true"
          :hide-class-badge="true"
          :override-top-padding="'14px'"
          @click.native="showMemberModal(msg.uuid)"
        />
        <div class="card">
          <chat-card
            :msg="msg"
            :group-id="groupId"
            @message-liked="messageLiked"
            @message-removed="messageRemoved"
            @show-member-modal="showMemberModal"
            @chat-card-mounted="itemWasMounted"
          />
        </div>
        <avatar
          v-if="user._id === msg.uuid"
          :class="{ invisible: avatarUnavailable(msg) }"
          :member="msg.userStyles || cachedProfileData[msg.uuid]"
          :avatar-only="true"
          :hide-class-badge="true"
          :override-top-padding="'14px'"
          @click.native="showMemberModal(msg.uuid)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .avatar {
    width: 10%;
    min-width: 7rem;
  }
  .loadmore {
    justify-content: center;

    > div {
      display: flex;
      width: 100%;
      align-items: center;

      button {
        text-align: center;
        color: $gray-50;
        margin-top: 12px;
        margin-bottom: 24px;
      }
    }
  }

  .loadmore-divider {
    height: 1px;
    background-color: $gray-500;
    flex: 1;
    margin-left: 24px;
    margin-right: 24px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .avatar-left {
    margin-left: -1.5rem;
    margin-right: 2rem;
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
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex';
import { userStateMixin } from '../../mixins/userState';

import Avatar from '../avatar';
import copyAsTodoModal from './copyAsTodoModal';
import chatCard from './chatCard';

export default {
  components: {
    copyAsTodoModal,
    chatCard,
    Avatar,
  },
  mixins: [userStateMixin],
  props: {
    chat: {},
    groupType: {},
    groupId: {},
    groupName: {},

    isLoading: Boolean,
    canLoadMore: Boolean,
  },
  data () {
    return {
      currentDayDividerDisplay: moment().day(),
      cachedProfileData: {},
      currentProfileLoadedCount: 0,
      currentProfileLoadedEnd: 10,
      loading: false,
      handleScrollBack: false,
      lastOffset: -1,
    };
  },
  computed: {
    // @TODO: We need a different lazy load mechnism.
    // But honestly, adding a paging route to chat would solve this
    messages () {
      this.loadProfileCache();
      return this.chat;
    },
  },
  mounted () {
    this.loadProfileCache();
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll () {
      this.loadProfileCache(window.scrollY / 1000);
    },
    async triggerLoad () {
      const { container } = this.$refs;

      // get current offset
      this.lastOffset = container.scrollTop - (container.scrollHeight - container.clientHeight);
      // disable scroll
      container.style.overflowY = 'hidden';
    },
    canViewFlag (message) {
      if (message.uuid === this.user._id) return true;
      if (!message.flagCount || message.flagCount < 2) return true;
      return this.hasPermission(this.user, 'moderator');
    },
    loadProfileCache: debounce(function loadProfileCache (screenPosition) {
      this._loadProfileCache(screenPosition);
    }, 1000),
    async _loadProfileCache (screenPosition) {
      if (this.loading) return;
      this.loading = true;

      const promises = [];
      const noProfilesLoaded = Object.keys(this.cachedProfileData).length === 0;

      // @TODO: write an explanation
      // @TODO: Remove this after enough messages are cached
      if (
        !noProfilesLoaded
        && screenPosition && Math.floor(screenPosition) + 1 > this.currentProfileLoadedEnd / 10
      ) {
        this.currentProfileLoadedEnd = 10 * (Math.floor(screenPosition) + 1);
      } else if (!noProfilesLoaded && screenPosition) {
        return;
      }

      const aboutToCache = {};
      this.messages.forEach(message => {
        const { uuid } = message;

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

      const results = await Promise.all(promises);
      results.forEach(result => {
        // We could not load the user. Maybe they were deleted.
        // So, let's cache empty so we don't try again
        if (!result || !result.data || result.status >= 400) {
          return;
        }

        const userData = result.data.data;
        this.$set(this.cachedProfileData, userData._id, userData);
      });

      // Merge in any attempts that were rejected so we don't attempt again
      for (const uuid in aboutToCache) {
        if (!this.cachedProfileData[uuid]) {
          this.$set(this.cachedProfileData, uuid, { rejected: true });
        }
      }

      this.loading = false;
    },
    avatarUnavailable ({ userStyles, uuid }) {
      const { cachedProfileData } = this;
      return (!userStyles && (!cachedProfileData[uuid] || cachedProfileData[uuid].rejected));
    },
    displayDivider (message) {
      if (this.currentDayDividerDisplay !== moment(message.timestamp).day()) {
        this.currentDayDividerDisplay = moment(message.timestamp).day();
        return true;
      }

      return false;
    },
    async showMemberModal (memberId) {
      this.$router.push({ name: 'userProfile', params: { userId: memberId } });
    },
    itemWasMounted: debounce(function itemWasMounted () {
      if (this.handleScrollBack) {
        this.handleScrollBack = false;

        const { container } = this.$refs;
        const offset = container.scrollHeight - container.clientHeight;

        const newOffset = offset + this.lastOffset;

        container.scrollTo(0, newOffset);
        // enable scroll again
        container.style.overflowY = 'scroll';
      }
    }, 50),
    messageLiked (message) {
      const chatIndex = findIndex(this.chat, chatMessage => chatMessage.id === message.id);
      this.chat.splice(chatIndex, 1, message);
    },
    messageRemoved (message) {
      const chatIndex = findIndex(this.chat, chatMessage => chatMessage.id === message.id);
      this.chat.splice(chatIndex, 1);
    },
  },
};
</script>
