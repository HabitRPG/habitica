<template>
  <b-modal
    id="rebirth"
    size="sm"
    :hide-header="true"
  >
    <div
      class="close-x"
      @click.stop="close()"
    >
      <div
        class="svg-icon svg-close"
        v-html="icons.close"
      ></div>
    </div>
    <div class="content text-center">
      <h2
        v-once
        class="header"
      >
        {{ $t('rebirthNewAchievement') }}
      </h2>
      <div class="d-flex align-items-center justify-content-center icon-area">
        <div
          v-once
          class="svg-icon sparkles mirror"
          v-html="icons.starGroup"
        ></div>
        <Sprite
          class="achievement-icon"
          image-name="achievement-sun2x"
        />
        <div
          v-once
          class="svg-icon sparkles"
          v-html="icons.starGroup"
        ></div>
      </div>
      <p class="subtitle">
        {{ $t('rebirthNewAdventure') }}
      </p>
      <p
        class="description"
        v-html="achievementText"
      ></p>
      <p
        v-once
        class="stack-info"
      >
        {{ $t('rebirthStackInfo') }}
      </p>
      <button
        v-once
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
    </div>
    <div
      slot="modal-footer"
      class="footer-wave"
      v-html="icons.purpleWaves"
    ></div>
  </b-modal>
</template>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  #rebirth {
    .modal-dialog {
      width: 330px;
    }

    .modal-content {
      border: none;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    .modal-body {
      padding: 0;
    }

    .modal-footer {
      padding: 0;
      border-top: none;
      border-radius: 0;
      margin: 0;
      line-height: 0;
    }
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .content {
    padding: 24px 24px 0;
  }

  .header {
    font-size: 1.25rem;
    line-height: 1.4;
    color: $purple-200;
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .icon-area {
    margin-bottom: 16px;
  }

  .sparkles {
    width: 40px;
    height: 64px;

    &.mirror {
      transform: scaleX(-1);
    }
  }

  .close-x {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;
    z-index: 2;

    &:hover .svg-close {
      opacity: 0.75;
    }

    .svg-close {
      width: 16px;
      height: 16px;
      opacity: 0.5;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
  }

  .achievement-icon {
    margin: 0 24px;
  }

  .subtitle {
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    margin-bottom: 12px;
    color: $gray-10;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.71;
    margin-bottom: 12px;
    color: $gray-50;
  }

  .stack-info {
    font-size: 0.875rem;
    line-height: 1.71;
    color: $gray-50;
    margin-bottom: 24px;
  }

  .btn-primary {
    margin-bottom: 8px;
  }

  .footer-wave {
    width: 100%;

    ::v-deep svg {
      display: block;
      width: calc(100% + 8px);
      height: auto;
      margin: 0 -4px -4px;
    }
  }
</style>

<script>
import closeIcon from '@/assets/svg/close.svg?raw';
import Sprite from '@/components/ui/sprite';
import starGroup from '@/assets/svg/star-group.svg?raw';
import purpleWaves from '@/assets/svg/purple-waves.svg?raw';
import { mapState } from '@/libs/store';

export default {
  components: {
    Sprite,
  },
  data () {
    return {
      icons: Object.freeze({
        starGroup,
        purpleWaves,
        close: closeIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    achievementText () {
      const rebirths = this.user.achievements.rebirths || 0;
      const level = this.user.achievements.rebirthLevel || 0;

      if (level >= 100) {
        return this.$t('rebirthAchievement100', { number: rebirths, level });
      }

      if (rebirths === 1) {
        return this.$t('rebirthAchievement', { number: rebirths, level });
      }

      return this.$t('rebirthAchievementPlural', { number: rebirths, level });
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'rebirth');
    },
  },
};
</script>
