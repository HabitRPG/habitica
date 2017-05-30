<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="user")
  div
    h3.character-name 
      | {{user.profile.name}}
      .is-buffed
        .icon(v-html="icons.buff", v-if="isBuffed")
    span.small-text.character-level {{ characterLevel }}
    .progress-container.d-flex
      .icon(v-html="icons.health")
      .progress
        .progress-bar.bg-health(:style="{width: `${percent(user.stats.hp, MAX_HEALTH)}%`}")
      span.small-text {{user.stats.hp | round}} / {{MAX_HEALTH}}
    .progress-container.d-flex
      .icon(v-html="icons.experience")
      .progress
        .progress-bar.bg-experience(:style="{width: `${percent(user.stats.exp, toNextLevel)}%`}")
      span.small-text {{user.stats.exp | round}} / {{toNextLevel}}
    .progress-container.d-flex(v-if="user.flags.classSelected && !user.preferences.disableClasses")
      .icon(v-html="icons.mana")
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
  height: 192px;
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

  .icon {
    width: 10px;
    height: 12px;
    margin: 0 auto;
    vertical-align: middle;
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

.progress-container > .icon {
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

const IconHealth = require('!svg-inline-loader!assets/header/health.svg');
const IconMana = require('!svg-inline-loader!assets/header/mana.svg');
const IconExperience = require('!svg-inline-loader!assets/header/experience.svg');
const IconBuff = require('!svg-inline-loader!assets/header/buff.svg');

export default {
  components: {
    Avatar,
  },
  methods: {
    percent,
  },
  data () {
    return {
      icons: {
        health: IconHealth,
        experience: IconExperience,
        mana: IconMana,
        buff: IconBuff,
      },
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