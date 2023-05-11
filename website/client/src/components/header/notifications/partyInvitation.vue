<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :notification="notification"
  >
    <div slot="content">
      <div
        v-html="$t('invitedToPartyBy', {
          userId: notification.data.inviter,
          userName: invitingUser.auth ? invitingUser.auth.local.username : null,
          party: notification.data.name,
        })"
      >
      </div>
      <div class="notifications-buttons">
        <div
          class="btn btn-small btn-success"
          @click.stop="accept()"
        >
          {{ $t('accept') }}
        </div>
        <div
          class="btn btn-small btn-danger"
          @click.stop="reject()"
        >
          {{ $t('reject') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import { mapState } from '@/libs/store';
import sync from '@/mixins/sync';

export default {
  components: {
    BaseNotification,
  },
  mixins: [sync],
  props: {
    notification: {
      type: Object,
      default (data) {
        return data;
      },
    },
    canRemove: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      invitingUser: {},
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.invitingUser = await this.$store.dispatch('members:fetchMember', {
      memberId: this.notification.data.inviter,
    });
  },
  methods: {
    async accept () {
      const group = this.notification.data;

      if (group.cancelledPlan && !window.confirm(this.$t('aboutToJoinCancelledGroupPlan'))) { // eslint-disable-line no-alert
        return;
      }

      await this.$store.dispatch('guilds:join', { groupId: group.id, type: 'party' });
      this.sync();
      this.$router.push('/party');
    },
    reject () {
      this.$store.dispatch('guilds:rejectInvite', { groupId: this.notification.data.id, type: 'party' });
    },
  },
};
</script>
