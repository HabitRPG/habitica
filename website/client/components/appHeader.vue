<template lang="pug">
#app-header.row
  avatar#header-avatar(:user="$store.state.user")
  .eight.wide.column
    strong {{user.profile.name}}
    p Lvl {{user.stats.lvl}}
    .progress-container
      .ui.progress.yellow
        .bar(:style="{width: `${user.stats.exp / 200 * 100}%`}")
      span {{user.stats.exp}} / 200
    .progress-container
      .ui.progress.error
        .bar(:style="{width: `${user.stats.hp / 50 * 100}%`}")
      span {{user.stats.hp.toFixed()}} / 50
    .progress-container(ng-if="user.flags.classSelected && !user.preferences.disableClasses")
      .ui.progress.blue
        .bar(:style="{width: `${user.stats.mp / 62 * 100}%`}")
      span {{user.stats.mp.toFixed()}} / {{62}}
</template>

<style>
#app-header {
  padding-bottom: 0;
  border-bottom: 1px solid black;
}

#header-avatar {
  margin-left: 1rem;
}

.progress-container {
  display: flex;
}

.progress-container > span {
  margin-left: 1rem;
  float: right;
  line-height: 1.75em;
  vertical-align: middle;
}

.progress-container > .ui.progress {
  flex-grow: 1;
  height: 1.75em;
  margin-bottom: 0.5em;
}
</style>

<script>
import Avatar from './avatar';
import { mapState } from '../store';

export default {
  components: {
    Avatar,
  },
  computed: {
    ...mapState(['user']),
  },
};
</script>