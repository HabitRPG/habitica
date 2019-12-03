<template>
  <b-modal
    id="onboarding-complete"
    size="sm"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="content text-center">
      <span
        class="close-icon svg-icon inline icon-10"
        @click="close()"
        v-html="icons.close"
      ></span>
      <h2>{{ $t('congratulations') }}</h2>
      <img
        class="onboarding-complete-banner d-block"
        src="~@/assets/images/onboarding-complete-banner@2x.png"
      >
      <p
        class="onboarding-complete-text"
        v-html="$t('onboardingCompleteDesc')"
      ></p>
      <button
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
    padding-top: 1em;
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
  margin-top: 18px;
}

.onboarding-complete-banner {
  width: 282px;
  margin: 0 auto;
  margin-bottom: 24px;
}

.onboarding-complete-text {
  margin-bottom: 24px;
}

.onboarding-complete-text ::v-deep .gold-amount {
  color: $yellow-5;
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
