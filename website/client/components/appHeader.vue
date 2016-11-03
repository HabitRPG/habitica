<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="$store.state.user")
  .eight.wide.column
    span.character-name {{user.profile.name}}
    span.character-level Lvl {{user.stats.lvl}}
    .progress-container
      img.icon(src="~assets/header/png/health@3x.png")
      .ui.progress.red
        .bar(:style="{width: `${percent(user.stats.hp, maxHealth)}%`}")
      span {{user.stats.hp | round}} / {{maxHealth}}
    .progress-container
      img.icon(src="~assets/header/png/experience@3x.png")
      .ui.progress.yellow
        .bar(:style="{width: `${percent(user.stats.exp, toNextLevel)}%`}")
      span {{user.stats.exp | round}} / {{toNextLevel}}
    .progress-container(ng-if="user.flags.classSelected && !user.preferences.disableClasses")
      img.icon(src="~assets/header/png/magic@3x.png")
      .ui.progress.blue
        .bar(:style="{width: `${percent(user.stats.mp, maxMP)}%`}")
      span {{user.stats.mp | round}} / {{maxMP}}
</template>

<style scoped>
#app-header {
  padding: 0px 0px 0px 20px;
  margin-top: 56px;
  background: #36205d;
  margin-left: 1rem;
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
  box-shadow: 0 2px 4px 0 rgba(53, 32, 93, 0.4);
}

.progress-container {
  display: flex;
  align-items: center;
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

.progress-container > .ui.progress {
  width: 203px;
  margin: 0px;
  border-radius: 0px;
  height: 12px;
  background-color: rgba(0, 0, 0, 0.35);
}

.progress-container > .ui.progress > .bar {
  border-radius: 0px;
  height: 12px;
  min-width: 0px;
}
</style>

<script>
import Avatar from './avatar';
import { mapState } from '../store';
import {
  maxHealth,
  statsComputed,
  percent,
  tnl,
} from '../../common/script';

export default {
  name: 'header',
  components: {
    Avatar,
  },
  filters: {
    percent,
    round (val) {
      return Math.round(val * 100) / 100;
    },
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
    ...mapState(['user']),
    maxMP () {
      return statsComputed(this.user).maxMP;
    },
    toNextLevel () { // Exp to next level
      return tnl(this.user.stats.lvl);
    },
  },
};
</script>