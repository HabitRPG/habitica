<template>
  <b-modal
    id="level-up"
    size="sm"
    :title="title"
    ok-only
    :ok-title="$t('onwards')"
    :footer-class="{ greyed: displayRewardQuest }"
  >
    <section class="d-flex">
      <span
        class="star-group mirror"
        v-html="icons.starGroup"
      ></span>
      <avatar
        class="avatar"
        :member="user"
      />
      <span
        class="star-group"
        v-html="icons.starGroup"
      ></span>
    </section>

    <p
      v-once
      class="text"
    >
      {{ $t('levelup') }}
    </p>

    <section
      v-if="displayRewardQuest"
      class="greyed"
    >
      <div
        v-once
        class="your-rewards d-flex"
      >
        <span
          class="sparkles"
          v-html="icons.sparkles"
        ></span>
        <span class="text">{{ $t('yourRewards') }}</span>
        <span
          class="sparkles mirror"
          v-html="icons.sparkles"
        ></span>
      </div>

      <div :class="questClass"></div>
    </section>
    <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
label(style='display:inline-block') {{ $t('dontShowAgain') }}
      -->
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #level-up {
    .modal-content {
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    @media (min-width: 576px) {
      .modal-sm {
        max-width: 330px;
      }
    }

    header {
      padding: 0;
      border: none;

      h5 {
        margin: 31px auto 16px;
        color: $purple-200;
      }

      button {
        position: absolute;
        right: 18px;
        top: 12px;
      }
    }

    footer {
      padding: 0;
      border: none;

      button {
        margin: 0 auto 32px auto;
      }
    }

    .greyed {
      background-color: $gray-700;
    }

    .modal-body {
      padding: 0;
    }

    .mirror {
      transform: scaleX(-1);
    }

    .star-group {
      margin: auto;

      svg {
        height: 64px;
        width: 40px;
      }
    }

    .avatar {
      cursor: auto;
    }

    .class-badge {
      display: none !important;
    }

    .text {
      margin: 25px 24px 24px;
      min-height: auto;
    }

    .your-rewards {
      margin: 0 auto;
      width: fit-content;

      .sparkles {
        width: 32px;
        margin-top: 12px;
      }

      .text {
        font-weight: bold;
        margin: 16px;
        color: $gray-50;
      }
    }

    section.greyed {
      padding-bottom: 17px
    }

    .scroll {
      margin: -11px auto 0;
    }
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import starGroup from '@/assets/svg/star-group.svg';
import sparkles from '@/assets/svg/sparkles-left.svg';

const levelQuests = {
  15: 'atom1',
  30: 'vice1',
  40: 'goldenknight1',
  60: 'moonstone1',
};

export default {
  components: {
    Avatar,
  },
  data () {
    return {
      icons: Object.freeze({
        starGroup,
        sparkles,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    title () {
      return this.$t('reachedLevel', { level: this.user.stats.lvl });
    },
    displayRewardQuest () {
      return this.user.stats.lvl in levelQuests;
    },
    questClass () {
      return `scroll inventory_quest_scroll_${levelQuests[this.user.stats.lvl]}`;
    },
  },
  methods: {
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp":
      // user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
