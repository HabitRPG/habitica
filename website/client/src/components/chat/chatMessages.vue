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
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <div
      v-for="msg in messages"
      v-if="chat && canViewFlag(msg)"
      :key="msg.id"
    >
      <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      <div
        v-if="user._id !== msg.uuid"
        class="d-flex"
      >
        <avatar
          v-if="msg.userStyles
            || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)"
          class="avatar-left"
          :member="msg.userStyles || cachedProfileData[msg.uuid]"
          :avatar-only="true"
          :override-top-padding="'14px'"
          :hide-class-badge="true"
          @click.native="showMemberModal(msg.uuid)"
        />
        <div
          class="card"
        >
          <chat-card
            :msg="msg"
            :group-id="groupId"
            @message-liked="messageLiked"
            @message-removed="messageRemoved"
            @show-member-modal="showMemberModal"
            @chat-card-mounted="itemWasMounted"
          />
        </div>
      </div>
      <div
        v-if="user._id === msg.uuid"
        class="d-flex"
      >
        <div
          class="card"
        >
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
          v-if="msg.userStyles
            || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)"
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
import { mapState } from '@/libs/store';

import Avatar from '../avatar';
import copyAsTodoModal from './copyAsTodoModal';
import chatCard from './chatCard';

export default {
  components: {
    copyAsTodoModal,
    chatCard,
    Avatar,
  },
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
    ...mapState({ user: 'user.data' }),
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
  destroyed () {
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
      return this.user.contributor.admin;
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
          this.$store.dispatch('snackbars:add', {
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
        this.$router.push({ name: 'userProfile', params: { userId: profile._id } });
      }
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
