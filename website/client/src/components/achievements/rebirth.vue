<template>
  <b-modal
    id="rebirth"
    size="sm"
    :hide-header="true"
  >
    <close-icon @click="close()" />
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

  .achievement-icon {
    margin: 0 8px;
  }

  .subtitle {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 12px;
    color: $gray-50;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.71;
    margin-bottom: 12px;
    color: $gray-100;
  }

  .stack-info {
    font-size: 0.875rem;
    line-height: 1.71;
    color: $gray-200;
    margin-bottom: 24px;
  }

  .btn-primary {
    margin-bottom: 24px;
  }

  .footer-wave {
    width: 100%;

    ::v-deep svg {
      display: block;
      width: 100%;
      height: auto;
    }
  }
</style>

<script>
import closeIcon from '@/components/shared/closeIcon';
import Sprite from '@/components/ui/sprite';
import starGroup from '@/assets/svg/star-group.svg?raw';
import purpleWaves from '@/assets/svg/purple-waves.svg?raw';
import { mapState } from '@/libs/store';

export default {
  components: {
    closeIcon,
    Sprite,
  },
  data () {
    return {
      icons: Object.freeze({
        starGroup,
        purpleWaves,
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
