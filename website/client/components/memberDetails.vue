<template lang="pug">
.d-flex
  avatar#header-avatar(:member="member")
  div(v-if="expanded")
    h3.character-name 
      | {{member.profile.name}}
      .is-buffed(v-if="isBuffed")
        .svg-icon(v-html="icons.buff")
    span.small-text.character-level {{ characterLevel }}
    .progress-container.d-flex
      .svg-icon(v-html="icons.health")
      .progress
        .progress-bar.bg-health(:style="{width: `${percent(member.stats.hp, MAX_HEALTH)}%`}")
      span.small-text {{member.stats.hp | round}} / {{MAX_HEALTH}}
    .progress-container.d-flex
      .svg-icon(v-html="icons.experience")
      .progress
        .progress-bar.bg-experience(:style="{width: `${percent(member.stats.exp, toNextLevel)}%`}")
      span.small-text {{member.stats.exp | round}} / {{toNextLevel}}
    .progress-container.d-flex(v-if="hasClass")
      .svg-icon(v-html="icons.mana")
      .progress
        .progress-bar.bg-mana(:style="{width: `${percent(member.stats.mp, maxMP)}%`}")
      span.small-text {{member.stats.mp | round}} / {{maxMP}}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.small-text {
  color: $header-color;
}

.character-name {
  margin-top: 24px;
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

  .svg-icon {
    display: block;
    width: 10px;
    height: 12px;
    margin: 0 auto;
  }
}

#header-avatar {
  margin-top: 24px;
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
  },
  props: {
    member: {
      type: Object,
      required: true,
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
  methods: {
    percent,
    hasClass () {
      return this.$store.getters['members:hasClass'](this.member);
    },
    isBuffed () {
      return this.$store.getters['members:isBuffed'](this.member);
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
  },
};
</script>
