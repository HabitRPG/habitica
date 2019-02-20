<template lang="pug">
.member-details(
  :class="{ condensed, expanded, 'd-flex': isHeader, row: !isHeader, }",
  @click='showMemberModal(member)'
)
  div(:class="{ 'col-4': !isHeader }")
    avatar(
      :member="member",
      @click.native="$emit('click')",
      @mouseover.native="$emit('onHover')",
      @mouseout.native="$emit('onHover')",
      :hide-class-badge="classBadgePosition !== 'under-avatar'",
    )
  .member-stats(:class="{'col-8': !expanded && !isHeader}")
    .d-flex.align-items-center.profile-first-row
      class-badge(v-if="classBadgePosition === 'next-to-name'", :member-class="member.stats.class")
      .d-flex.flex-column.profile-name-character
        h3.character-name
          | {{member.profile.name}}
          .is-buffed(v-if="isBuffed", v-b-tooltip.hover.bottom="$t('buffed')")
            .svg-icon(v-html="icons.buff")
        .small-text.character-level
          span.mr-1(v-if="member.auth && member.auth.local && member.auth.local.username") @{{ member.auth.local.username }}
          span.mr-1(v-if="member.auth && member.auth.local && member.auth.local.username") •
          span {{ characterLevel }}
    stats-bar(
      :icon="icons.health",
      :value="member.stats.hp",
      :maxValue="MAX_HEALTH",
      :tooltip="$t('health')",
      progressClass="bg-health",
      :condensed="condensed"
    )
    stats-bar(
      :icon="icons.experience",
      :value="member.stats.exp",
      :maxValue="toNextLevel",
      :tooltip="$t('experience')",
      progressClass="bg-experience",
      :condensed="condensed"
    )
    stats-bar(
      v-if="hasClass",
      :icon="icons.mana",
      :value="member.stats.mp",
      :maxValue="maxMP",
      :tooltip="$t('mana')",
      progressClass="bg-mana",
      :condensed="condensed"
    )
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .member-details {
    white-space: nowrap;
    transition: all 0.15s ease-out;
  }

  .member-stats {
    padding-left: 12px;
    padding-right: 24px;
    opacity: 1;
    transition: width 0.15s ease-out;
  }

  .member-details.condensed:not(.expanded) .member-stats {
    opacity: 0;
    display: none;
  }

  .small-text {
    color: $header-color;
  }

  .profile-name-character {
    margin-left: 12px;
  }

  .character-name {
    margin-bottom: 1px;
    color: $white;
  }

  .character-level {
    font-style: normal;
    margin-bottom: .5em;
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
  .member-details.condensed.expanded {
    background: $header-dark-background;
    box-shadow: 0 0 0px 9px $header-dark-background;
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
      margin-top: -9px;
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
import { mapState } from 'client/libs/store';
import Profile from './userMenu/profile';
import StatsBar from './ui/statsbar';

import { toNextLevel } from '../../common/script/statHelpers';
import statsComputed from '../../common/script/libs/statsComputed';
import percent from '../../common/script/libs/percent';

import buffIcon from 'assets/svg/buff.svg';
import healthIcon from 'assets/svg/health.svg';
import experienceIcon from 'assets/svg/experience.svg';
import manaIcon from 'assets/svg/mana.svg';

export default {
  components: {
    Avatar,
    Profile,
    ClassBadge,
    StatsBar,
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
  filters: {
    statFloor (value) {
      if (value < 1 && value > 0) {
        return Math.ceil(value * 10) / 10;
      } else {
        return Math.floor(value);
      }
    },
  },
  methods: {
    percent,
    showMemberModal (member) {
      this.$router.push({name: 'userProfile', params: {userId: member._id}});
    },
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
        this.member.stats.class ? this.$t(this.member.stats.class) : ''
      }`;
    },
    isBuffed () {
      return this.$store.getters['members:isBuffed'](this.member);
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.member);
    },
  },
};
</script>
