<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="$store.state.user")
  .eight.wide.column
    span.character-name {{user.profile.name}}
    span.character-level Lvl {{user.stats.lvl}}
    .progress-container
      img.icon(src="~assets/header/png/health@3x.png")
      .ui.progress.yellow
        .bar(:style="{width: `${user.stats.exp / 200 * 100}%`}")
      span {{user.stats.exp}} / 200
    .progress-container
      img.icon(src="~assets/header/png/experience@3x.png")
      .ui.progress.error
        .bar(:style="{width: `${user.stats.hp / 50 * 100}%`}")
      span {{user.stats.hp.toFixed()}} / 50
    .progress-container(ng-if="user.flags.classSelected && !user.preferences.disableClasses")
      img.icon(src="~assets/header/png/magic@3x.png")
      .ui.progress.blue
        .bar(:style="{width: `${user.stats.mp / 62 * 100}%`}")
      span {{user.stats.mp.toFixed()}} / {{62}}
</template>

<style scoped>
#app-header {
  padding: 0px 0px 0px 20px;
  margin-top: 31.5px;
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
}
</style>

<script>
import Avatar from './avatar';
import { mapState } from '../store';

export default {
  name: 'header',
  components: {
    Avatar,
  },
  computed: {
    ...mapState(['user']),
  },
};
</script>