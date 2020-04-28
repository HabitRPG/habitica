<template>
  <div
    class="onboarding-guide-panel d-flex align-items-center flex-column p-4 dropdown-separated"
    @click.stop.prevent="action"
  >
    <div
      class="svg-icon onboarding-toggle"
      :class="{'onboarding-toggle-open': open}"
      @click="openPanel"
      v-html="icons.down"
    ></div>
    <div
      v-once
      class="svg-icon onboarding-guide-banner"
      v-html="icons.onboardingGuideBanner"
    ></div>
    <h3
      v-once
      class="getting-started"
    >
      {{ $t('gettingStarted') }}
    </h3>
    <span
      v-once
      class="getting-started-desc"
      v-html="$t('gettingStartedDesc')"
    ></span>
    <div
      class="onboarding-progress-box d-flex flex-row justify-content-between small-text mb-2"
    >
      <strong v-once>{{ $t('yourProgress') }}</strong>
      <span :class="{'has-progress': progress > 0}">{{ progressText }}</span>
    </div>
    <div class="onboarding-progress-bar mb-3">
      <div
        class="onboarding-progress-bar-fill"
        :style="{width: `${progress}%`}"
      ></div>
    </div>
    <b-collapse
      id="onboardingPanelCollapse"
      v-model="open"
    >
      <div
        v-for="(achievement, key) in onboardingAchievements"
        :key="key"
        :class="{
          'achievement-earned': achievement.earned
        }"
        class="achievement-box d-flex flex-row"
      >
        <div class="achievement-icon-wrapper">
          <div :class="`achievement-icon ${getAchievementIcon(achievement)}`"></div>
        </div>
        <div class="achievement-info d-flex flex-column">
          <strong
            v-once
            class="achievement-title"
          >{{ achievement.title }}</strong>
          <span
            v-once
            class="small-text achievement-desc"
          >{{ getAchievementText(key) }}</span>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  .onboarding-guide-panel {
    white-space: normal;
    text-align: center;
  }

  .onboarding-toggle {
    cursor: pointer;
    position: absolute;
    top: 75px;
    right: 24px;
    width: 16px;
    & ::v-deep svg path {
      stroke: $gray-200;
    }

    &:hover ::v-deep svg path {
      stroke: $gray-100;
    }

    &-open {
      transform: rotate(-180deg);
    }
  }

  .onboarding-guide-banner {
    margin-top: -8px;
    margin-bottom: 12px;
    width: 154px;
    height: 48px;
  }

  .getting-started {
    margin-bottom: 4px;
  }

  .getting-started-desc {
    font-size: 14px;
    padding-bottom: 12px;
  }

  .getting-started-desc ::v-deep .gold-amount {
    color: $yellow-5;
  }

  .onboarding-progress-box {
    width: 100%;
    font-style: normal;

    strong {
      color: $gray-50;
    }

    .has-progress {
      color: $yellow-5;
    }
  }

  .onboarding-progress-bar {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background-color: $gray-600;

    .onboarding-progress-bar-fill {
      height: 100%;
      border-radius: 2px;
      background: $yellow-5;
    }
  }

  .achievement-box {
    padding-top: 11px;
    padding-bottom: 12px;
    border-bottom: 1px dashed $gray-500;
    width: 100%;

    &:last-child {
      padding-bottom: 0px;
      border-bottom: none;
    }
  }

  .achievement-earned {
    .achievement-icon-wrapper {
      opacity: 1;
    }

    color: $gray-200;

    .achievement-title {
      text-decoration: line-through;
    }
  }

  .achievement-icon-wrapper {
    opacity: 0.5;
    width: 40px;

    .achievement-icon {
      margin-left: -12px;
      transform: scale(0.5);
    }
  }

  .achievement-info {
    width: 100%;
    text-align: left;
    font-size: 14px;
  }

  .achievement-title {
    margin-bottom: 4px;
  }

  .achievement-desc {
    font-style: normal;
  }
</style>

<script>
import achievs from '@/../../common/script/libs/achievements';
import { mapState } from '@/libs/store';

import onboardingGuideBanner from '@/assets/svg/onboarding-guide-banner.svg';
import downIcon from '@/assets/svg/down.svg';

export default {
  props: {
    neverSeen: { // whether it's ever been seen by the user
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        onboardingGuideBanner,
        down: downIcon,
      }),
      open: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    onboardingAchievements () {
      return achievs.getAchievementsForProfile(this.user).onboarding.achievements;
    },
    progress () {
      const keys = Object.keys(this.onboardingAchievements);
      let nEarned = 0;

      keys.forEach(key => {
        if (this.onboardingAchievements[key].earned) nEarned += 1;
      });

      return (nEarned / keys.length) * 100;
    },
    progressText () {
      if (this.progress === 0) {
        return this.$t('letsGetStarted');
      }

      return this.$t('onboardingProgress', { percentage: this.progress });
    },
  },
  created () {
    // null means it's never been automatically toggled
    if (this.neverSeen === true) {
      // The first time the panel should be automatically opened
      this.open = true;
    }
  },
  methods: {
    getAchievementIcon (achievement) {
      if (achievement.earned) {
        return `${achievement.icon}2x`;
      }

      return 'achievement-unearned2x';
    },
    getAchievementText (key) {
      let stringKey = 'achievement';
      stringKey += key.charAt(0).toUpperCase() + key.slice(1);
      stringKey += 'ModalText';

      return this.$t(stringKey);
    },
    openPanel (e) {
      e.preventDefault();
      e.stopPropagation();
      this.open = !this.open;
    },
    action () {
      // Do nothing, used to prevent closure on click.
    },
  },
};
</script>
