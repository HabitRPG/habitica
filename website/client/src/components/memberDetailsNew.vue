<template>
  <div
    class="member-details-new"
    :class="{ condensed, expanded }"
    @click="showMemberModal(member)"
  >
    <div>
      <avatar
        :member="member"
        :hide-class-badge="true"
        @click.native="$emit('click')"
        @mouseover.native="$emit('onHover')"
        @mouseout.native="$emit('onHover')"
      />
    </div>
    <div
      class="member-stats"
    >
      <div class="d-flex align-items-center profile-first-row">
        <class-badge
          v-if="classBadgePosition === 'next-to-name'"
          :member-class="member.stats.class"
        />
        <div class="d-flex flex-column profile-name-character">
          <h3 class="character-name mt-75">
            <user-link
              :user-id="member._id"
              :name="member.profile.name"
              :backer="member.backer"
              :contributor="member.contributor"
              :smaller-style="true"
            />
            <inline-class-badge
              v-if="member.stats"
              class="inline-class-badge"
              :member-class="member.stats.class"
            />
          </h3>
          <div class="small-text character-level">
            <span
              v-if="member.auth && member.auth.local && member.auth.local.username"
              class="mr-1"
            >@{{ member.auth.local.username }}</span>
            <span
              v-if="member.auth && member.auth.local && member.auth.local.username"
              class="mr-1"
            >•</span>
            <span>{{ characterLevel }}</span>
          </div>
        </div>
      </div>
      <stats-bar
        class="mt-3 stats-bar"
        :icon="icons.health"
        :value="member.stats.hp"
        :max-value="MAX_HEALTH"
        :tooltip="$t('health')"
        progress-class="bg-health-new"
        :condensed="condensed"
        :show-icon="false"
        :show-numbers="false"
      />
      <stats-bar
        class="mt-75 stats-bar"
        :icon="icons.experience"
        :value="member.stats.exp"
        :max-value="toNextLevel"
        :tooltip="$t('experience')"
        progress-class="bg-experience-new"
        :condensed="condensed"
        :show-icon="false"
        :show-numbers="false"
      />
      <stats-bar
        v-if="hasClass"
        class="mt-75 stats-bar"
        :icon="icons.mana"
        :value="member.stats.mp"
        :max-value="maxMP"
        :tooltip="$t('mana')"
        progress-class="bg-mana-new"
        :condensed="condensed"
        :show-icon="false"
        :show-numbers="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .stats-bar {
    margin-left: 0;
    height: 12px;
    border-radius: 2px;

    ::v-deep {
      .bg-health-new {
        background: $red-50;
      }

      .bg-experience-new {
        background: $yellow-100;
      }

      .bg-mana-new {
        background: $blue-100;
      }

      .progress-bar {
        border-radius: 0;
      }

      .progress {
        width: 100%;
        --progress-background: #{$gray-500};
      }
    }
  }

  .inline-class-badge {
    margin-left: 10px;
    display: inline-block;
  }

  .member-details-new {
    white-space: nowrap;
    transition: all 0.15s ease-out;

    display: flex;
    flex-direction: row;
  }

  .member-stats {
    flex: 1;
    padding-left: 1rem;
    padding-right: 24px;
    opacity: 1;
    transition: width 0.15s ease-out;
  }

  .member-details-new.condensed:not(.expanded) .member-stats {
    opacity: 0;
    display: none;
  }

  .small-text {
    color: $header-color;
  }

  .profile-name-character {

  }

  .character-name {
    margin-bottom: 1px;
    color: $white;
    height: 24px;
    display: flex;
    flex-direction: row;

    align-items: center;

    ::v-deep {
      .user-link {
        display: flex;
        align-items: center;
      }
    }
  }

  .character-level {
    font-style: normal;
    color: $gray-100;
  }

  .is-buffed {
    width: 20px;
    height: 20px;
    background: $header-dark-background;
    display: inline-block;
    margin-left: 16px;
    vertical-align: middle;
    padding-top: 4px;

    .svg-icon {
      display: block;
      width: 10px;
      height: 12px;
      margin: 0 auto;
    }
  }

  .profile-first-row {
    margin-bottom: .5em
  }

  // Condensed version
  .member-details-new.condensed.expanded {
    background: $header-dark-background;
    box-shadow: 0 0 0px 8px $header-dark-background;
    position: relative;
    z-index: 8;

    .is-buffed {
      background-color: $purple-50;
    }

    .member-stats {
      background: $header-dark-background;
      position: absolute;
      right: 100%;
      height: calc(100% + 18px);
      margin-top: -10px;
      margin-right: 1px;
      padding-top: 9px;
      padding-bottom: 24px;
      padding-right: 16px;
      padding-bottom: 14px;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      z-index: 9;
    }
  }
</style>

<script>
import Avatar from './avatar';
import ClassBadge from './members/classBadge';
import { mapState } from '@/libs/store';
import StatsBar from './ui/statsbar';
import userLink from './userLink';

import { toNextLevel } from '@/../../common/script/statHelpers';
import statsComputed from '@/../../common/script/libs/statsComputed';
import percent from '@/../../common/script/libs/percent';

import buffIcon from '@/assets/svg/buff.svg';
import healthIcon from '@/assets/svg/health.svg';
import experienceIcon from '@/assets/svg/experience.svg';
import manaIcon from '@/assets/svg/mana.svg';
import InlineClassBadge from './members/inlineClassBadge';
import { getClassName } from '../../../common/script/libs/getClassName';

export default {
  components: {
    InlineClassBadge,
    Avatar,
    ClassBadge,
    StatsBar,
    userLink,
  },
  filters: {
    statFloor (value) {
      if (value < 1 && value > 0) {
        return Math.ceil(value * 10) / 10;
      }
      return Math.floor(value);
    },
  },
  props: {
    member: {
      type: Object,
      required: true,
    },
    condensed: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    classBadgePosition: {
      type: String,
      default: 'under-avatar', // next-to-name or hidden
    },
    isHeader: {
      type: Boolean,
      default: false,
    },
    disableNameStyling: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        buff: buffIcon,
        health: healthIcon,
        experience: experienceIcon,
        mana: manaIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      MAX_HEALTH: 'constants.MAX_HEALTH',
    }),
    maxMP () {
      return statsComputed(this.member).maxMP;
    },
    toNextLevel () { // Exp to next level
      return toNextLevel(this.member.stats.lvl);
    },
    characterLevel () {
      return `${this.$t('level')} ${this.member.stats.lvl} ${
        this.member.stats.class ? this.getClassName(this.member.stats.class) : ''
      }`;
    },
    isBuffed () {
      return this.$store.getters['members:isBuffed'](this.member);
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.member);
    },
  },
  methods: {
    percent,
    showMemberModal (member) {
      this.$router.push({ name: 'userProfile', params: { userId: member._id } });
    },
    getClassName (classType) {
      return this.$t(getClassName(classType));
    },
  },
};
</script>
