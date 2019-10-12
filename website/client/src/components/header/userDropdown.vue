<template>
  <menu-dropdown
    class="item-user"
    :right="true"
  >
    <div slot="dropdown-toggle">
      <div
        v-b-tooltip.hover.bottom="$t('user')"
        :aria-label="$t('user')"
      >
        <message-count
          v-if="user.inbox.newMessages > 0"
          :count="user.inbox.newMessages"
          :top="true"
        /><div
          class="top-menu-icon svg-icon user"
          v-html="icons.user"
        ></div>
      </div>
    </div><div
      slot="dropdown-content"
      class="user-dropdown"
    >
      <a
        class="dropdown-item edit-avatar dropdown-separated"
        @click="showAvatar('body', 'size')"
      ><h3>{{ user.profile.name }}</h3><span class="small-text">{{ $t('editAvatar') }}</span></a><a
        class="nav-link dropdown-item dropdown-separated d-flex justify-content-between align-items-center"
        @click.prevent="showInbox()"
      ><div>{{ $t('messages') }}</div><message-count
        v-if="user.inbox.newMessages > 0"
        :count="user.inbox.newMessages"
      /></a><a
        class="dropdown-item"
        @click="showAvatar('backgrounds', '2019')"
      >{{ $t('backgrounds') }}</a><a
        class="dropdown-item"
        @click="showProfile('stats')"
      >{{ $t('stats') }}</a><a
        class="dropdown-item"
        @click="showProfile('achievements')"
      >{{ $t('achievements') }}</a><a
        class="dropdown-item dropdown-separated"
        @click="showProfile('profile')"
      >{{ $t('profile') }}</a><router-link
        class="dropdown-item"
        :to="{name: 'site'}"
      >
        {{ $t('settings') }}
      </router-link><router-link
        class="dropdown-item dropdown-separated"
        :to="{name: 'subscription'}"
      >
        {{ $t('subscription') }}
      </router-link><a
        class="nav-link dropdown-item dropdown-separated"
        @click.prevent="logout()"
      >{{ $t('logout') }}</a><li
        v-if="!this.user.purchased.plan.customerId"
        @click="showBuyGemsModal('subscribe')"
      >
        <div class="dropdown-item text-center">
          <h3 class="purple">
            {{ $t('needMoreGems') }}
          </h3><span class="small-text">{{ $t('needMoreGemsInfo') }}</span>
        </div><div class="learn-background py-2 text-center">
          <button class="btn btn-primary btn-lg learn-button">
            {{ $t('learnMore') }}
          </button>
        </div>
      </li>
    </div>
  </menu-dropdown>
</template>

<style lang='scss' scoped>
@import '~@/assets/scss/colors.scss';

.edit-avatar {
  h3 {
    color: $gray-10;
    margin-bottom: 0px;
  }

  padding-top: 16px;
  padding-bottom: 16px;
}

.user-dropdown {
  width: 14.75em;
}

.learn-background {
    background: url('~@/assets/images/gem-rain.png') bottom left no-repeat,
                url('~@/assets/images/gold-rain.png') bottom right no-repeat;
}

.learn-button {
  margin: 0.75em 0.75em 0.75em 1em;
}

.purple {
  color: $purple-200;
}

.small-text {
  color: $gray-200;
  font-style: normal;
  display: block;
  white-space: normal;
  font-weight: bold;
}
</style>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';
import userIcon from '@/assets/svg/user.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import markPMSRead from '@/../../common/script/ops/markPMSRead';
import MessageCount from './messageCount';

export default {
  components: {
    MenuDropdown,
    MessageCount,
  },
  data () {
    return {
      icons: Object.freeze({
        user: userIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    showAvatar (startingPage, subpage) {
      this.$store.state.avatarEditorOptions.editingUser = true;
      this.$store.state.avatarEditorOptions.startingPage = startingPage;
      this.$store.state.avatarEditorOptions.subpage = subpage;
      this.$root.$emit('bv::show::modal', 'avatar-modal');
    },
    showInbox () {
      markPMSRead(this.user);
      axios.post('/api/v4/user/mark-pms-read');
      this.$root.$emit('bv::show::modal', 'inbox-modal');
    },
    showProfile (startingPage) {
      this.$router.push({ name: startingPage });
    },
    showBuyGemsModal (startingPage) {
      this.$store.state.gemModalOptions.startingPage = startingPage;

      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > User Dropdown',
      });

      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
    logout () {
      this.$store.dispatch('auth:logout');
    },
  },
};
</script>
