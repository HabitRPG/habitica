<template>
  <base-notification
    :can-remove="false"
    :has-icon="false"
    :read-after-click="false"
    :notification="{}"
    @click="action"
  >
    <div
      slot="content"
      class="text-center"
    >
      <div class="username-notification-title">
        {{ $t('setUsernameNotificationTitle') }}
      </div>
      <div>{{ $t('changeUsernameDisclaimer') }}</div>
      <div class="current-username-container mx-auto">
        <label class="font-weight-bold">{{ $t('currentUsername') + " " }}</label>
        <label>@</label>
        <label>{{ user.auth.local.username }}</label>
      </div>
      <div class="notifications-buttons">
        <div
          class="btn btn-small btn-secondary"
          @click.stop="changeUsername()"
        >
          {{ $t('goToSettings') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>
<style lang='scss'>
  @import '../../../assets/scss/colors.scss';

  .username-notification-title {
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: bold;
    color: $purple-300;
  }

  .current-username-container {
    border-radius: 2px;
    background-color: #f9f9f9;
    border: solid 1px #e1e0e3;
    padding: 8px 16px 8px 16px;
    display: inline-block;
    margin-top: 16px;
    margin-bottom: 16px;

    label {
      display: inline;
    }

    .notification-buttons {
      display: inline-block;
    }
  }

</style>
<script>
import axios from 'axios';
import BaseNotification from './base';
import { mapState } from '@/libs/store';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification'],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    action () {
      this.$router.push({ name: 'site' });
    },
    async confirmUsername () {
      await axios.put('/api/v4/user/auth/update-username', { username: this.user.auth.local.username });
    },
    changeUsername () {
      this.$router.push({ name: 'site' });
    },

  },
};
</script>
