<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="user")
  div
    span.character-name {{user.profile.name}}
    span.character-level Lvl {{user.stats.lvl}}
    .progress-container.d-flex
      img.icon(src="~assets/header/png/health@3x.png")
      .progress
        .progress-bar.bg-danger(:style="{width: `${percent(user.stats.hp, maxHealth)}%`}")
      span {{user.stats.hp | round}} / {{maxHealth}}
    .progress-container.d-flex
      img.icon(src="~assets/header/png/experience@3x.png")
      .progress
        .progress-bar.bg-warning(:style="{width: `${percent(user.stats.exp, toNextLevel)}%`}")
      span {{user.stats.exp | round}} / {{toNextLevel}}
    .progress-container.d-flex(ng-if="user.flags.classSelected && !user.preferences.disableClasses")
      img.icon(src="~assets/header/png/magic@3x.png")
      .progress
        .progress-bar(:style="{width: `${percent(user.stats.mp, maxMP)}%`}")
      span {{user.stats.mp | round}} / {{maxMP}}
</template>

<style scoped>
/* TODO refactor: only partially ported from SemanticUI; */
#app-header {
  padding-left: 14px;
  margin-top: 56px;
  background: #36205d;
  height: 192px;
  color: #d5c8ff;
}

.character-name {
  display: block;
  font-size: 16px;
  margin-top: 32px;
  line-height: 1.5;
  color: #fff;
  font-weight: bold;
}

.character-level {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 20px;
  line-height: 1;
}

#header-avatar {
  margin-top: 24px;
  margin-right: 1rem;
  box-shadow: 0 2px 4px 0 rgba(53, 32, 93, 0.4);
}

.progress-container {
  margin-bottom: 12px;
}

.progress-container > span {
  font-size: 12px;
  margin-left: 10px;
  line-height: 1em;
}

.progress-container > .icon {
  width: 12px;
  height: 12px;
  margin-right: 10px;
}

.progress-container > .progress {
  width: 203px;
  margin: 0px;
  border-radius: 0px;
  height: 12px;
  background-color: rgba(0, 0, 0, 0.35);
}

.progress-container > .progress > .progress-bar {
  border-radius: 0px;
  height: 12px;
  min-width: 0px;
}
</style>

<script>
import Avatar from './avatar';
import { mapState } from '../store';

import { toNextLevel } from '../../common/script/statHelpers';
import { MAX_HEALTH as maxHealth } from '../../common/script/constants';
import statsComputed from '../../common/script/libs/statsComputed';
import percent from '../../common/script/libs/percent';

export default {
  name: 'header',
  components: {
    Avatar,
  },
  methods: {
    percent,
  },
  data () {
    return {
      maxHealth,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    maxMP () {
      return statsComputed(this.user).maxMP;
    },
    toNextLevel () { // Exp to next level
      return toNextLevel(this.user.stats.lvl);
    },
  },
};
</script>