<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  @click="action",
)
  div(slot="content")
    .message(v-html="$t('invitedToQuest', {quest: questName})")
    quest-info(:quest="questData", :small-version="true")
    .notifications-buttons
      .btn.btn-small.btn-success(@click.stop="questAccept()") {{ $t('accept') }}
      .btn.btn-small.btn-danger(@click.stop="questReject()") {{ $t('reject') }}
</template>

<style lang="scss">
.message {
  margin-bottom: 8px;
}
</style>

<script>
import BaseNotification from './base';
import { mapState } from '@/libs/store';
import * as quests from '@/../../common/script/content/quests';
import questInfo from '@/components/shops/quests/questInfo';

export default {
  components: {
    BaseNotification,
    questInfo,
  },
  props: ['notification', 'canRemove'],
  computed: {
    ...mapState({ user: 'user.data' }),
    questData () {
      return quests.quests[this.notification.data.quest];
    },
    questName () {
      return this.questData.text();
    },
  },
  methods: {
    action () {
      this.$router.push({ name: 'party' });
    },
    async questAccept () {
      this.user.party.quest = await this.$store.dispatch('quests:sendAction', {
        groupId: this.notification.data.partyId,
        action: 'quests/accept',
      });
    },
    async questReject () {
      this.user.party.quest = await this.$store.dispatch('quests:sendAction', {
        groupId: this.notification.data.partyId,
        action: 'quests/reject',
      });
    },
  },
};
</script>
