<template>
  <div
    ref="container"
    class="container-fluid"
  >
    <div class="row loadmore">
      <div v-if="canLoadMore && !isLoading">
        <div class="loadmore-divider-holder">
          <div class="loadmore-divider"></div>
        </div>
        <button
          class="btn btn-secondary"
          @click="triggerLoad()"
        >
          {{ $t('loadEarlierMessages') }}
        </button>
        <div class="loadmore-divider-holder">
          <div class="loadmore-divider"></div>
        </div>
      </div>
      <h2
        v-show="isLoading"
        class="col-12 loading"
      >
        {{ $t('loading') }}
      </h2>
    </div>
    <div
      v-for="(msg) in messages"
      :key="msg.id"
      class="row message-row"
      :class="{ 'margin-right': user._id !== msg.uuid}"
    >
      <div
        class="d-flex flex-grow-1"
      >
        <avatar
          v-if="user._id !== msg.uuid && conversationOpponentUser"
          class="avatar-left"
          :member="conversationOpponentUser"
          :avatar-only="true"
          :override-top-padding="'14px'"
          :hide-class-badge="true"
          @click.native="showMemberModal(msg.uuid)"
        />
        <div
          class="card"
          :class="{'card-right': user._id !== msg.uuid, 'card-left': user._id === msg.uuid}"
        >
          <message-card
            :msg="msg"
            @message-removed="messageRemoved"
            @show-member-modal="showMemberModal"
            @message-card-mounted="itemWasMounted"
          />
        </div>
        <avatar
          v-if="user && user._id === msg.uuid"
          class="avatar-right"
          :member="user"
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
    width: 170px;
    min-width: 8rem;
    height: 120px;
    padding-top: 0 !important;
  }

  .avatar-right {
    margin-left: -1rem;

    ::v-deep .character-sprites {
      margin-right: 1rem !important;
    }
  }

  .card {
    border: 0px;
    margin-bottom: 1rem;
    padding: 0rem;
    width: 684px;
  }
  .message-row {
    margin-left: 12px;
    margin-right: 12px;

    &:not(.margin-right) {
      .d-flex {
        justify-content: flex-end;
      }
    }
  }
  @media only screen and (max-width: 1200px) {
    .card {
      width: 100%;
    }
  }

  @media only screen and (min-width: 1400px) {
    .message-row {
      margin-left: -15px;
      margin-right: -30px;
    }
  }

  .card-left {
    border: 1px solid $purple-500;
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
    margin-right: 12px;
    margin-top: 12px;
    margin-bottom: 24px;

    > div {
      display: flex;
      width: 100%;
      align-items: center;

      button {
        text-align: center;
        color: $gray-50;
      }
    }
  }

  .loadmore-divider-holder {
    flex: 1;
    margin-left: 24px;
    margin-right: 24px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .loadmore-divider {
    height: 1px;
    border-top: 1px $gray-500 solid;
    width: 100%;

  }

  .loading {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

</style>

<script>
import moment from 'moment';
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';

import Avatar from '../avatar';
import messageCard from './messageCard';

export default {
  components: {
    Avatar,
    messageCard,
  },
  props: {
    chat: {},
    isLoading: Boolean,
    canLoadMore: Boolean,
    conversationOpponentUser: {},
  },
  data () {
    return {
      currentDayDividerDisplay: moment().day(),
      loading: false,
      handleScrollBack: false,
      lastOffset: -1,
      disablePerfectScroll: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    // @TODO: We need a different lazy load mechnism.
    // But honestly, adding a paging route to chat would solve this
    messages () {
      return this.chat;
    },
  },
  mounted () {
    this.$el.addEventListener('selectstart', () => this.handleSelectStart());
    this.$el.addEventListener('mouseup', () => this.handleSelectChange());
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy () {
    this.$el.removeEventListener('selectstart', () => this.handleSelectStart());
    this.$el.removeEventListener('mouseup', () => this.handleSelectChange());
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    async triggerLoad () {
      const { container } = this.$refs;

      // get current offset
      this.lastOffset = container.scrollTop - (container.scrollHeight - container.clientHeight);
      // disable scroll
      // container.style.overflowY = 'hidden';

      const canLoadMore = !this.isLoading && this.canLoadMore;

      if (canLoadMore) {
        const triggerLoadResult = this.$emit('triggerLoad');

        await triggerLoadResult;

        this.handleScrollBack = true;
      }
    },
    displayDivider (message) {
      const day = moment(message.timestamp).day();
      if (this.currentDayDividerDisplay !== day) {
        this.currentDayDividerDisplay = day;
        return true;
      }

      return false;
    },
    showMemberModal (memberId) {
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
        // container.style.overflowY = 'scroll';
      }
    }, 50),
    messageRemoved (message) {
      this.$emit('message-removed', message);
    },
    handleSelectStart () {
      this.disablePerfectScroll = true;
    },
    handleSelectChange () {
      this.disablePerfectScroll = false;
    },
  },
};
</script>
