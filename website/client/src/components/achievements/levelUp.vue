<template>
  <b-modal
    id="level-up"
    size="sm"
    :title="title"
    ok-only
    :ok-title="$t('onwards')"
    v-bind:footer-class="{ greyed: displayRewardQuest }"
  >
    <section class="flex">
      <span
        class="star-group mirror"
        v-html="starGroup"
      ></span>
      <avatar
        class="avatar"
        :member="user"
      />
      <span
        class="star-group"
        v-html="starGroup"
      ></span>
    </section>

    <hr>
    <p class="text">
      {{ $t('levelup') }}
    </p>

    <section
      v-if="displayRewardQuest"
      class="greyed"
    >
      <div class="your-rewards flex">
        <span
          class="sparkles"
          v-html="sparkles"
        ></span>
        <span class="text">{{ $t('yourRewards') }}</span>
        <span
          class="sparkles mirror"
          v-html="sparkles"
        ></span>
      </div>

      <div :class="questClass"></div>
      <hr>
    </section>
    <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
label(style='display:inline-block') {{ $t('dontShowAgain') }}
      -->
  </b-modal>
</template>

<style lang="scss">
  #level-up {
    @media (min-width: 576px) {
      .modal-sm {
        max-width: 330px;
      }
    }

    header {
      padding: 0;
      border: none;

      h5 {
        margin: 31px auto 16px auto;
        color: #4f2a93;
      }

      button {
        position: absolute;
        right: 18px;
        top: 12px;
      }
    }

    section {
      width: 100%;
      margin: 0;
    }

    hr {
      margin: 0;
      border-top: 25px solid rgb(255 63 249 / .2);
    }

    footer {
      padding: 0;
      border: none;

      button {
        margin: 0 auto 32px auto;
      }
    }

    .flex {
      display: flex;
    }

    .greyed {
      background-color: #f9f9f9;
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
      margin: 0 24px 24px 24px;
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
        color: #4e4a57;
      }
    }

    .scroll {
      margin: -9px auto;
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
      starGroup,
      sparkles,
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
