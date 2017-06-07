<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="user")
  div
    h3.character-name 
      | {{user.profile.name}}
      .is-buffed(v-if="isBuffed")
        .svg-icon(v-html="icons.buff")
    span.small-text.character-level {{ characterLevel }}
    .progress-container.d-flex
      .svg-icon(v-html="icons.health")
      .progress
        .progress-bar.bg-health(:style="{width: `${percent(user.stats.hp, MAX_HEALTH)}%`}")
      span.small-text {{user.stats.hp | round}} / {{MAX_HEALTH}}
    .progress-container.d-flex
      .svg-icon(v-html="icons.experience")
      .progress
        .progress-bar.bg-experience(:style="{width: `${percent(user.stats.exp, toNextLevel)}%`}")
      span.small-text {{user.stats.exp | round}} / {{toNextLevel}}
    .progress-container.d-flex(v-if="user.flags.classSelected && !user.preferences.disableClasses")
      .svg-icon(v-html="icons.mana")
      .progress
        .progress-bar.bg-mana(:style="{width: `${percent(user.stats.mp, maxMP)}%`}")
      span.small-text {{user.stats.mp | round}} / {{maxMP}}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

$header-dark-background: #271B3D;

#app-header {
  padding-left: 14px;
  margin-top: 56px;
  background: $purple-50;
  height: 204px;
  color: $header-color;
}

.character-name {
  margin-top: 24px;
  color: $white;
  margin-bottom: 1px;
}

.character-level {
  display: block;
  font-style: normal;
  color: $header-color;
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
  width: 203px;
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
import { mapState, mapGetters } from 'client/libs/store';

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
  methods: {
    percent,
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
      user: 'user.data',
      MAX_HEALTH: 'constants.MAX_HEALTH',
    }),
    ...mapGetters({
      isBuffed: 'user:isBuffed',
    }),
    maxMP () {
      return statsComputed(this.user).maxMP;
    },
    toNextLevel () { // Exp to next level
      return toNextLevel(this.user.stats.lvl);
    },
    characterLevel () {
      return `${this.$t('level')} ${this.user.stats.lvl} ${
        this.user.stats.class ? this.$t(this.user.stats.class) : ''
      }`;
    },
  },
};
</script>