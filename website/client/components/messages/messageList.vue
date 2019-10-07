<template lang="pug">
  .container-fluid(ref="container")
    .row.loadmore
      div(v-if="canLoadMore")
        .loadmore-divider
        button.btn.btn-secondary(@click='triggerLoad()') {{ $t('loadEarlierMessages') }}
        .loadmore-divider
      h2.col-12.loading(v-show="isLoading") {{ $t('loading') }}
    .row.ml-2(v-for="(msg, index) in messages", v-if='chat', :class='{"mr-2": user._id !== msg.uuid}')
      .d-flex.flex-grow-1(v-if='user._id !== msg.uuid')
        avatar.avatar-left(
          v-if='msg.userStyles || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)',
          :member="msg.userStyles || cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :overrideTopPadding='"14px"',
          :hideClassBadge='true',
          @click.native="showMemberModal(msg.uuid)",
        )
        .card.card-right
          message-card(
            :msg='msg',
            @message-removed='messageRemoved',
            @show-member-modal='showMemberModal',
            @chat-card-mounted='itemWasMounted')
      .d-flex.flex-grow-1(v-if='user._id === msg.uuid')
        .card.card-left
          message-card(
            :msg='msg',
            @message-removed='messageRemoved',
            @show-member-modal='showMemberModal',
            @chat-card-mounted='itemWasMounted')
        avatar.avatar-right(
          v-if='msg.userStyles || (cachedProfileData[msg.uuid] && !cachedProfileData[msg.uuid].rejected)',
          :member="msg.userStyles || cachedProfileData[msg.uuid]",
          :avatarOnly="true",
          :hideClassBadge='true',
          :overrideTopPadding='"14px"',
          @click.native="showMemberModal(msg.uuid)",
        )
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .avatar {
    width: 15%;
    min-width: 8rem;
    height: 120px;
    padding-top: 0 !important;
  }

  .avatar-left {
    margin-left: -3rem;
  }

  .avatar-right {
    margin-left: -2rem;
  }

  .card {
    border: 0px;
    margin-bottom: 0.5em;
    padding: 0rem;
    width: 85%;
  }

  .card-left {
    border: 1px solid $header-color;
  }

  .card-right {
    border: 1px solid $gray-500;
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
</style>

<script>
  import moment from 'moment';
  import axios from 'axios';
  import { mapState } from 'client/libs/store';
  import debounce from 'lodash/debounce';
  import findIndex from 'lodash/findIndex';

  import Avatar from '../avatar';
  import messageCard from './messageCard';

  export default {
    props: {
      chat: {},
      isLoading: Boolean,
      canLoadMore: Boolean,
    },
    components: {
      Avatar,
      messageCard,
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
        handleScrollBack: false,
        lastOffset: -1,
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
    methods: {
      handleScroll () {
        this.loadProfileCache(window.scrollY / 1000);
      },
      async triggerLoad () {
        const container = this.$refs.container;

        // get current offset
        this.lastOffset = container.scrollTop - (container.scrollHeight - container.clientHeight);
        // disable scroll
        container.style.overflowY = 'hidden';

        const canLoadMore = this.inbox && !this.isLoading && this.canLoadMore;
        if (canLoadMore) {
          await this.$emit('triggerLoad');
          this.handleScrollBack = true;
        }
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
      itemWasMounted: debounce(function itemWasMounted ()  {
        if (this.handleScrollBack) {
          this.handleScrollBack = false;

          const container = this.$refs.container;
          const offset = container.scrollHeight - container.clientHeight;

          const newOffset = offset + this.lastOffset;

          container.scrollTo(0, newOffset);
          // enable scroll again
          container.style.overflowY = 'scroll';
        }
      }, 50),
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
