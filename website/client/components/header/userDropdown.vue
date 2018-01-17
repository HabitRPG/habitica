<template lang="pug">
menu-dropdown.item-user(:right="true")
  div(slot="dropdown-toggle")
    div(v-b-tooltip.hover.bottom="$t('user')")
      message-count(v-if='user.inbox.newMessages > 0', :count="user.inbox.newMessages", :top="true")
      .svg-icon.user(v-html="icons.user")
  .user-dropdown(slot="dropdown-content")
    a.dropdown-item.edit-avatar.dropdown-separated(@click='showAvatar()')
      h3 {{ user.profile.name }}
      span.small-text {{ $t('editAvatar') }}
    a.nav-link.dropdown-item.dropdown-separated(@click.prevent='showInbox()')
      | {{ $t('messages') }}
      message-count(v-if='user.inbox.newMessages > 0', :count="user.inbox.newMessages")
    a.dropdown-item(@click='showAvatar("backgrounds", "2018")') {{ $t('backgrounds') }}
    a.dropdown-item(@click='showProfile("stats")') {{ $t('stats') }}
    a.dropdown-item(@click='showProfile("achievements")') {{ $t('achievements') }}
    a.dropdown-item.dropdown-separated(@click='showProfile("profile")') {{ $t('profile') }}
    router-link.dropdown-item(:to="{name: 'site'}") {{ $t('settings') }}
    router-link.dropdown-item.dropdown-separated(:to="{name: 'subscription'}") {{ $t('subscription') }}
    a.nav-link.dropdown-item.dropdown-separated(@click.prevent='logout()') {{ $t('logout') }}
    li(v-if='!this.user.purchased.plan.customerId', @click='showBuyGemsModal("subscribe")')
      .dropdown-item.text-center
        h3.purple {{ $t('needMoreGems') }}
        span.small-text {{ $t('needMoreGemsInfo') }}
      img.float-left.align-self-end(src='~assets/images/gem-rain.png')
      button.btn.btn-primary.btn-lg.learn-button Learn More
      img.float-right.align-self-end(src='~assets/images/gold-rain.png')
</template>

<style lang='scss' scoped>
@import '~client/assets/scss/colors.scss';

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
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import userIcon from 'assets/svg/user.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import axios from 'axios';
import markPMSRead from 'common/script/ops/markPMSRead';
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
    ...mapState({user: 'user.data'}),
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
      axios.post('/api/v3/user/mark-pms-read');
      this.$root.$emit('bv::show::modal', 'inbox-modal');
    },
    showProfile (startingPage) {
      this.$root.$emit('habitica:show-profile', {
        user: this.user,
        startingPage,
      });
    },
    showBuyGemsModal (startingPage) {
      this.$store.state.gemModalOptions.startingPage = startingPage;

      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > User Dropdown',
      });

      this.$root.$emit('bv::show::modal', 'buy-gems', {alreadyTracked: true});
    },
    logout () {
      this.$store.dispatch('auth:logout');
    },
  },
};
</script>
