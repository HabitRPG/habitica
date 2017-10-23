<template lang="pug">
menu-dropdown.item-user
  div(slot="dropdown-toggle")
    span.message-count.top-count(v-if='user.inbox.newMessages > 0') {{user.inbox.newMessages}}
    .svg-icon.user(v-html="icons.user")
  div(slot="dropdown-content")
    a.dropdown-item.edit-avatar.dropdown-separated(@click='showAvatar()')
      h3 {{ user.profile.name }}
      span.small-text {{ $t('editAvatar') }}
    a.nav-link.dropdown-item.dropdown-separated(@click.prevent='showInbox()')
      | {{ $t('messages') }}
      span.message-count(v-if='user.inbox.newMessages > 0') {{user.inbox.newMessages}}
    a.dropdown-item(@click='showAvatar("backgrounds", "2017")') {{ $t('backgrounds') }}
    a.dropdown-item(@click='showProfile("stats")') {{ $t('stats') }}
    a.dropdown-item(@click='showProfile("achievements")') {{ $t('achievements') }}
    a.dropdown-item.dropdown-separated(@click='showProfile("profile")') {{ $t('profile') }}
    router-link.dropdown-item(:to="{name: 'site'}") {{ $t('settings') }}
    router-link.dropdown-item.dropdown-separated(:to="{name: 'subscription'}") {{ $t('subscription') }}
    a.nav-link.dropdown-item.dropdown-separated(to="/", @click.prevent='logout()') {{ $t('logout') }}
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
</style>

<script>
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import quests from 'common/script/content/quests';
import notificationsIcon from 'assets/svg/notifications.svg';
import MenuDropdown from './customMenuDropdown';

export default {
  components: {
    MenuDropdown,
  },
  data () {
    return {
      icons: Object.freeze({
        notifications: notificationsIcon,
      }),
      quests,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    party () {
      return {name: ''};
      // return this.user.party;
    },
    userNewMessages () {
      // @TODO: For some reason data becomes corrupted. We should fix this on the server
      let userNewMessages = [];
      for (let key in this.user.newMessages) {
        let message = this.user.newMessages[key];
        if (message && message.name && message.value) {
          message.key = key;
          userNewMessages.push(message);
        }
      }
      return userNewMessages;
    },
    notificationsCount () {
      let count = 0;

      if (this.user.invitations.parties) {
        count += this.user.invitations.parties.length;
      }

      if (this.user.purchased.plan && this.user.purchased.plan.mysteryItems.length) {
        count++;
      }

      if (this.user.invitations.guilds) {
        count += this.user.invitations.guilds.length;
      }

      if (this.user.flags.classSelected && !this.user.preferences.disableClasses && this.user.stats.points) {
        count += this.user.stats.points > 0 ? 1 : 0;
      }

      if (this.userNewMessages) {
        count += Object.keys(this.userNewMessages).length;
      }

      return count;
    },
  },
  methods: {
    // @TODO: I hate this function, we can do better with a hashmap
    selectNotificationValue (mysteryValue, invitationValue, cardValue,
      unallocatedValue, messageValue, noneValue, groupApprovalRequested, groupApproved) {
      let user = this.user;

      if (user.purchased && user.purchased.plan && user.purchased.plan.mysteryItems && user.purchased.plan.mysteryItems.length) {
        return mysteryValue;
      } else if (user.invitations.parties && user.invitations.parties.length > 0 || user.invitations.guilds && user.invitations.guilds.length > 0) {
        return invitationValue;
      } else if (user.flags.cardReceived) {
        return cardValue;
      } else if (user.flags.classSelected && !(user.preferences && user.preferences.disableClasses) && user.stats.points) {
        return unallocatedValue;
      } else if (!isEmpty(user.newMessages)) {
        return messageValue;
      } else if (!isEmpty(user.groupNotifications)) {
        let groupNotificationTypes = map(user.groupNotifications, 'type');
        if (groupNotificationTypes.indexOf('GROUP_TASK_APPROVAL') !== -1) {
          return groupApprovalRequested;
        } else if (groupNotificationTypes.indexOf('GROUP_TASK_APPROVED') !== -1) {
          return groupApproved;
        }
        return noneValue;
      } else {
        return noneValue;
      }
    },
    hasQuestProgress () {
      let user = this.user;
      if (user.party.quest) {
        let userQuest = quests[user.party.quest.key];

        if (!userQuest) {
          return false;
        }
        if (userQuest.boss && user.party.quest.progress.up > 0) {
          return true;
        }
        if (userQuest.collect && user.party.quest.progress.collectedItems > 0) {
          return true;
        }
      }
      return false;
    },
    getQuestInfo () {
      let user = this.user;
      let questInfo = {};
      if (user.party.quest) {
        let userQuest = quests[user.party.quest.key];

        questInfo.title = userQuest.text();

        if (userQuest.boss) {
          questInfo.body =  this.$t('questTaskDamage', { damage: user.party.quest.progress.up.toFixed(1) });
        } else if (userQuest.collect) {
          questInfo.body = this.$t('questTaskCollection', { items: user.party.quest.progress.collectedItems });
        }
      }
      return questInfo;
    },
    clearMessages (key) {
      this.$store.dispatch('chat:markChatSeen', {groupId: key});
      this.$delete(this.user.newMessages, key);
    },
    clearCards () {
      this.$store.dispatch('chat:clearCards');
    },
    iconClasses () {
      return this.selectNotificationValue(
        'glyphicon-gift',
        'glyphicon-user',
        'glyphicon-envelope',
        'glyphicon-plus-sign',
        'glyphicon-comment',
        'glyphicon-comment inactive',
        'glyphicon-question-sign',
        'glyphicon-ok-sign'
      );
    },
    hasNoNotifications () {
      return this.selectNotificationValue(false, false, false, false, false, true, false, false);
    },
    viewGroupApprovalNotification (notification, index, navigate) {
      // @TODO: USe notifications: User.readNotification(notification.id);
      this.user.groupNotifications.splice(index, 1);
      return navigate; // @TODO: remove
      // @TODO: this.$router.go if (navigate) go('options.social.guilds.detail', {gid: notification.data.groupId});
    },
    groupApprovalNotificationIcon (notification) {
      if (notification.type === 'GROUP_TASK_APPROVAL') {
        return 'glyphicon glyphicon-question-sign';
      } else if (notification.type === 'GROUP_TASK_APPROVED') {
        return 'glyphicon glyphicon-ok-sign';
      }
    },
    go (path) {
      this.$router.push(path);
    },
    navigateToGroup (key) {
      if (key === this.party._id || key === this.user.party._id) {
        this.go('/party');
        return;
      }

      this.$router.push({ name: 'guild', params: { groupId: key }});
    },
    async reject (group) {
      await this.$store.dispatch('guilds:rejectInvite', {groupId: group.id});
      // @TODO: User.sync();
    },
    async accept (group, index, type) {
      if (group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }

      if (type === 'party') {
        // @TODO: pretty sure mutability is wrong. Need to check React docs
        // @TODO mutation to store data should only happen through actions
        this.user.invitations.parties.splice(index, 1);

        Analytics.updateUser({partyID: group.id});
      } else {
        this.user.invitations.guilds.splice(index, 1);
      }

      if (type === 'party') {
        this.user.party._id = group.id;
        this.$router.push('/party');
      } else {
        this.user.guilds.push(group.id);
        this.$router.push(`/groups/guild/${group.id}`);
      }

      // @TODO: check for party , type: 'myGuilds'
      await this.$store.dispatch('guilds:join', {guildId: group.id});
    },
    async questAccept (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/accept'});
      this.user.party.quest = quest;
    },
    async questReject (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/reject'});
      this.user.party.quest = quest;
    },
  },
};
</script>
