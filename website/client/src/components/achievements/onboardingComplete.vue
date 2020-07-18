<template>
  <b-modal
    id="onboarding-complete"
    size="sm"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="content text-center">
      <span
        v-once
        class="close-icon svg-icon inline icon-10"
        @click="close()"
        v-html="icons.close"
      ></span>
      <h2 v-once>
        {{ $t('onboardingComplete') }}
      </h2>
      <img
        class="onboarding-complete-banner d-block"
        src="~@/assets/images/onboarding-complete-banner@2x.png"
      >
      <p
        v-once
        class="onboarding-complete-text"
        v-html="$t('onboardingCompleteDesc')"
      ></p>
      <p
        v-once
        class="onboarding-complete-text-small"
      >
        {{ $t('onboardingCompleteDescSmall') }}
      </p>
      <button
        v-once
        class="btn btn-primary"
        @click="closeWithAction()"
      >
        {{ $t('viewAchievements') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
#onboarding-complete {
  .modal-content {
    min-width: 330px;
  }

  .modal-body {
    padding-top: 1rem;
    padding-bottom: 0;
  }

  .modal-footer {
    margin-top: 0;
  }
}
</style>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

h2 {
  color: $purple-200;
  margin-bottom: 24px;
  margin-top: 2px;
}

.content {
  padding: 0 8px;
  margin-top: 1rem;
}

.onboarding-complete-banner {
  width: 282px;
  margin: 0 auto;
  margin-bottom: 24px;
}

.onboarding-complete-text {
  margin-bottom: 1rem;
}

.onboarding-complete-text ::v-deep .gold-amount {
  color: $yellow-5;
}

.onboarding-complete-text-small {
  margin-bottom: 1.5rem;
  color: $gray-100;
  font-style: normal;
  font-size: 12px;
  line-height: 1.33;
}

button {
  margin-bottom: 24px;
}
</style>

<script>
import svgClose from '@/assets/svg/close.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
      }),
    };
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'onboarding-complete');
    },
    closeWithAction () {
      this.close();
      setTimeout(() => {
        this.$router.push({ name: 'achievements' });
      }, 200);
    },
  },
};
</script>
