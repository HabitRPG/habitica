<template lang="pug">
.ui.top.fixed.menu
  .header.item Habitica
  router-link.item(to="/") Tasks
  // .simple makes it possible to have a dropdown without JS
  .ui.simple.dropdown
    router-link.item(to="/inventory") Inventory
    .menu
      router-link.item(to="/inventory") Inventory
      router-link.item(to="/inventory/stable") Stable
      router-link.item(to="/inventory/equipment") Equipment
  router-link.item(to="/market") Market
  .ui.simple.dropdown
    router-link.item(to="/social/tavern") Social
    .menu
      router-link.item(to="/social/tavern") Tavern
      router-link.item(to="/social/inbox") Inbox
      router-link.item(to="/social/challenges") Challenges
      router-link.item(to="/social/party") Party
      router-link.item(to="/social/guilds") Guilds
  .ui.simple.dropdown
    router-link.item(to="/") Help
    .menu
      router-link.item(to="/") Faq
      router-link.item(to="/") Report a bug
      router-link.item(to="/") Request a feature
  .right.menu
    .item
      i.icon.diamond
      | {{userGems}}
    .item
      i.icon.money
      | {{Math.floor(user.stats.gp * 100) / 100}}
    a.item
      i.icon.alarm
    .ui.simple.dropdown
      router-link.item(to="/user/avatar")
        i.icon.user
      .menu
        router-link.item(to="/user/avatar") Avatar
        router-link.item(to="/user/stats") Stats
        router-link.item(to="/user/achievements") Achievements
        .divider
        router-link.item(to="/user/settings") Settings
        .divider
        router-link.item(to="/") Logout
</template>

<style>
.ui.menu .right.menu .ui.simple.dropdown > .item::before {
    right: auto;
    left: 0;
}
</style>

<script>
import { mapState, mapGetters } from '../store';

export default {
  computed: {
    ...mapGetters(['userGems']),
    ...mapState(['user']),
  },
};
</script>