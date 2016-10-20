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
  .ui.simple.dropdown
    router-link.item(to="/user/avatar") User
    .menu
      router-link.item(to="/user/avatar") Avatar
      router-link.item(to="/user/stats") Stats
      router-link.item(to="/user/achievements") Achievements
      .divider
      router-link.item(to="/user/settings") Settings
      .divider
      router-link.item(to="/") Logout
</template>

<script>
export default {
};
</script>