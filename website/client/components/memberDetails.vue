<template lang="pug">
div
  .d-flex.member-details(:class="{ condensed, expanded }", @click='showMemberModal(member)')
    avatar(:member="member",
      @click.native="$emit('click')",
      @mouseover.native="$emit('onHover')",
      @mouseout.native="$emit('onHover')",
    )
    .member-stats
      h3.character-name
        | {{member.profile.name}}
        .is-buffed(v-if="isBuffed")
          .svg-icon(v-html="icons.buff")
      span.small-text.character-level {{ characterLevel }}
      .progress-container.d-flex
        .svg-icon(v-html="icons.health")
        .progress
          .progress-bar.bg-health(:style="{width: `${percent(member.stats.hp, MAX_HEALTH)}%`}")
        span.small-text {{member.stats.hp | statFloor}} / {{MAX_HEALTH}}
      .progress-container.d-flex
        .svg-icon(v-html="icons.experience")
        .progress
          .progress-bar.bg-experience(:style="{width: `${percent(member.stats.exp, toNextLevel)}%`}")
        span.small-text {{member.stats.exp | statFloor}} / {{toNextLevel}}
      .progress-container.d-flex(v-if="hasClass")
        .svg-icon(v-html="icons.mana")
        .progress
          .progress-bar.bg-mana(:style="{width: `${percent(member.stats.mp, maxMP)}%`}")
        span.small-text {{member.stats.mp | statFloor}} / {{maxMP}}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .member-details {
    white-space: nowrap;
    margin-top: 24px;
    margin-bottom: 24px;
    transition: all 0.15s ease-out;
  }

  .member-stats {
    padding-left: 16px;
    padding-right: 24px;
    opacity: 1;
    transition: width 0.15s ease-out;
  }

  .member-details.condensed:not(.expanded) .member-stats {
    opacity: 0;
    display: none;
  }

  // Condensed version
  .member-details.condensed.expanded {
    background: $header-dark-background;
    box-shadow: 0 0 0px 9px $header-dark-background;
    position: relative;
    margin-bottom: 33px;
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
      padding-top: 9px;
      padding-bottom: 24px;
      padding-right: 16px;
      padding-bottom: 14px;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      z-index: 9;
    }

    .progress-container > .svg-icon {
      width: 19px;
      height: 19px;
      margin-top: -2px;
    }

    .progress-container > .progress {
      width: 152px;
      border-radius: 0px;
      height: 10px;
      margin-top: 2px;
      background: $purple-100;
    }

    .progress-container > .progress > .progress-bar {
      border-radius: 0px;
      height: 10px;
    }
  }

  .small-text {
    color: $header-color;
  }

  .character-name {
    margin-bottom: 1px;
    color: $white;
  }

  .character-level {
    display: block;
    font-style: normal;
    margin-bottom: 16px;
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

  #header-avatar {
    margin-right: 16px;
  }

  .progress-container {
    margin-bottom: 12px;
  }

  .progress-container > span {
    color: $header-color;
    margin-left: 16px;
    font-style: normal;
  }

  .progress-container > .svg-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    margin-top: -4px;
  }

  .progress-container > .progress {
    width: 303px;
    margin: 0px;
    border-radius: 2px;
    height: 16px;
    background-color: $header-dark-background;
  }

  .progress-container > .progress > .progress-bar {
    border-radius: 2px;
    height: 16px;
    min-width: 0px;
  }
</style>

<script>
import Avatar from './avatar';
import { mapState } from 'client/libs/store';
import profile from './userMenu/profile';

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
    profile,
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
      this.$store.state.profileUser = member;
      this.$store.state.profileOptions.startingPage = 'profile';
      this.$root.$emit('show::modal', 'profile');
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
