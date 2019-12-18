<template>
  <b-modal
    id="streak"
    :title="$t('streakAchievement')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <!-- @TODO: +achievementAvatar('thermometer',2.5)-->
        <achievement-avatar class="avatar" />
      </div>
      <div class="col-6 offset-3 text-center">
        <h3 v-if="user.achievements.streak === 1">
          {{ $t('firstStreakAchievement') }}
        </h3>
        <h3
          v-if="user.achievements.streak > 1"
        >
          {{ $t('streakAchievementCount', {streaks: user.achievements.streak}) }}
        </h3>
        <p>{{ $t('twentyOneDays') }}</p>
        <p>{{ $t('dontBreakStreak') }}</p>
        <br>
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('dontStop') }}
        </button>
        <div class="checkbox">
          <input
            id="user-preferences-suppressModals-streak"
            v-model="user.preferences.suppressModals.streak"
            type="checkbox"
            @change="suppressModals"
          >
          <label for="user-preferences-suppressModals-streak">{{ $t('dontShowAgain') }}</label>
        </div>
      </div>
    </div>
    <achievement-footer />
  </b-modal>
</template>

<style scoped>
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import achievementFooter from './achievementFooter';
import achievementAvatar from './achievementAvatar';

import { mapState } from '@/libs/store';

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'streak');
    },
    suppressModals () {
      const surpress = !!this.user.preferences.suppressModals.streak;
      this.$store.dispatch('user:set', { 'preferences.suppressModals.streak': surpress });
    },
  },
};
</script>
