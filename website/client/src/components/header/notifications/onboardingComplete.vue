<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :read-after-click="true"
    :notification="notification"
    :has-text="false"
    @click="action"
  >
    <div
      slot="content"
      class="d-flex flex-column align-items-center onboarding-complete-content"
    >
      <img
        class="onboarding-complete-banner d-block"
        src="~@/assets/images/onboarding-complete-banner@2x.png"
      >
      <h3 v-once>
        {{ $t('onboardingComplete') }}
      </h3>
      <p
        v-once
        class="onboarding-complete-text"
        v-html="$t('onboardingCompleteDesc')"
      ></p>
      <div class="notifications-buttons">
        <div
          v-once
          class="btn btn-small btn-primary btn-block"
        >
          {{ $t('viewAchievements') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.onboarding-complete-content {
  text-align: center;
}

.onboarding-complete-banner {
  width: 282px;
  margin-top: 12px;
  margin-bottom: 12px;
}

.onboarding-complete-text {
  margin-bottom: 4px;
}

.onboarding-complete-text ::v-deep .gold-amount {
  color: $yellow-5;
}

.notifications-buttons {
  width: 100%;
}
</style>

<script>
import BaseNotification from './base';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  methods: {
    action () {
      this.$router.push({ name: 'achievements' });
    },
  },
};
</script>
