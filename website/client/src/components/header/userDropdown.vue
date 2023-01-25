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
        />
        <div
          class="top-menu-icon svg-icon user"
          v-html="icons.user"
        ></div>
      </div>
    </div>
    <div
      slot="dropdown-content"
      class="user-dropdown"
    >
      <a
        class="topbar-dropdown-item nav-link dropdown-item
         dropdown-separated d-flex justify-content-between align-items-center"
        @click.prevent="showPrivateMessages()"
      >
        <div>{{ $t('messages') }}</div>
        <message-count
          v-if="user.inbox.newMessages > 0"
          :count="user.inbox.newMessages"
        />
      </a>
      <a
        class="topbar-dropdown-item dropdown-item"
        @click="showAvatar('body', 'size')"
      >{{ $t('editAvatar') }}</a>
      <a
        class="topbar-dropdown-item dropdown-item dropdown-separated"
        @click="showAvatar('backgrounds', '2023')"
      >{{ $t('backgrounds') }}</a>
      <a
        class="topbar-dropdown-item dropdown-item"
        @click="showProfile('profile')"
      >{{ $t('profile') }}</a>
      <a
        class="topbar-dropdown-item dropdown-item"
        @click="showProfile('stats')"
      >{{ $t('stats') }}</a>
      <a
        class="topbar-dropdown-item dropdown-item dropdown-separated"
        @click="showProfile('achievements')"
      >{{ $t('achievements') }}</a>
      <router-link
        class="topbar-dropdown-item dropdown-item"
        :to="{name: 'site'}"
      >
        {{ $t('settings') }}
      </router-link>
      <router-link
        class="topbar-dropdown-item dropdown-item dropdown-separated"
        :to="{name: 'subscription'}"
      >
        {{ $t('subscription') }}
      </router-link>
      <a
        class="topbar-dropdown-item nav-link dropdown-item dropdown-separated"
        @click.prevent="logout()"
      >{{ $t('logout') }}</a>
      <li
        v-if="!user.purchased.plan.customerId"
        class="topbar-dropdown-item dropdown-item dropdown-separated
          d-flex flex-column justify-content-center align-items-center dropdown-inactive subs-info"
      >
        <span
          v-once
          class="purple d-block font-weight-bold mb-3"
        >
          {{ $t('lookingForMoreItems') }}
        </span>
        <img
          class="swords mb-3"
          srcset="
        ~@/assets/images/swords.png,
        ~@/assets/images/swords@2x.png 2x,
        ~@/assets/images/swords@3x.png 3x"
          src="~@/assets/images/swords.png"
        >
        <p
          v-once
          class="subs-benefits mb-3"
        >
          {{ $t('dropCapSubs') }}
        </p>
        <button
          v-once
          class="btn btn-primary mb-4"
          @click="toLearnMore()"
        >
          {{ $t('learnMore') }}
        </button>
      </li>
    </div>
  </menu-dropdown>
</template>

<style lang='scss' scoped>
@import '~@/assets/scss/colors.scss';

.user-dropdown {
  width: 14.75em;
}

.purple {
  color: $purple-300;
}

.subs-info {
  padding-top: 1.438rem;
  padding-bottom: 0;
}

.subs-benefits {
  font-size: 0.75rem;
  line-height: 1.33;
  font-style: normal;
  white-space: normal;
  text-align: center;
}

.swords {
  width: 7rem;
  height: 3rem;
}
</style>

<script>
import { mapState } from '@/libs/store';
import userIcon from '@/assets/svg/user.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import MessageCount from './messageCount';
import { EVENTS } from '@/libs/events';
import { PAGES } from '@/libs/consts';

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
    showPrivateMessages () {
      if (this.$router.history.current.name === 'privateMessages') {
        this.$root.$emit(EVENTS.PM_REFRESH);
      } else {
        this.$router.push(PAGES.PRIVATE_MESSAGES);
      }
    },
    showProfile (startingPage) {
      this.$router.push({ name: startingPage });
    },
    toLearnMore () {
      this.$router.push({ name: 'subscription' });
    },
    logout () {
      this.$store.dispatch('auth:logout');
    },
  },
};
</script>
