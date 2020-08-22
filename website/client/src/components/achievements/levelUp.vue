<template>
  <b-modal
    id="level-up"
    :title="title"
    size="sm"
  >
    <div class="modal-body text-center">
      <div class="sparkly-avatar">
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
      </div>

      <hr>
      <p class="text">
        {{ $t('levelup') }}
      </p>
    </div>

    <template v-slot:modal-footer>
      <div
        v-if="displayRewardQuest"
        class="greyed"
      >
        <div class="rewardList">
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
      </div>

      <div :class="{ greyed: displayRewardQuest }">
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('onwards') }}
        </button>
      </div>
      <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
  'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
  label(style='display:inline-block') {{ $t('dontShowAgain') }}
        -->
    </template>
  </b-modal>
</template>

<style lang="scss">
  #level-up {
    @media (min-width: 576px) {
      .modal-sm {
        max-width: 330px;
      }
    }

    hr {
      margin: 0;
      border: 0;
      border-top: 25px solid #ff3ff9;
      opacity: 0.2;
    }

    .text {
      font-size: 14px;
      text-align: center;
    }

    .mirror svg {
      transform: scaleX(-1);
    }

    header {
      padding: 0;
      text-align: center;
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

    .modal-body {
      padding: 0;

      .sparkly-avatar {
        display: flex;
      }

      .star-group {
        margin: auto;
      }

      .star-group svg {
        height: 64px;
        width: 40px;
      }

      .character-sprites {
        margin-left: -2rem !important;
      }

      .class-badge {
        display: none !important;
      }

      .text {
        color: #686274;
        padding: 0 24px 24px 24px;
        margin: 0;
      }
    }

    footer {
      margin: 0;
      padding: 0;
      border: none;

      div:not(.scroll) {
        width: 100%;
        margin: 0;
      }

      .rewardList, div:last-child {
        display: flex;
      }

      .sparkles {
        width: 32px;
        margin-top: 12px;
      }

      .sparkles:not(.mirror) {
        margin-left: auto;
      }

      .sparkles.mirror {
        margin-right: auto;
      }

      .text {
        font-weight: bold;
        margin: 16px;
        min-height: auto;
        color: #4e4a57;
      }

      .scroll {
        margin: -9px auto;
      }

      button {
        margin: 0 auto 32px auto;
      }

      .greyed {
        background-color: #f9f9f9;
      }
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
    close () {
      this.$root.$emit('bv::hide::modal', 'level-up');
    },
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp":
      // user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
