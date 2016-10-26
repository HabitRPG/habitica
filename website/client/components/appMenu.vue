<template lang="pug">
#app-menu.ui.top.fixed.menu
  .header.item Habitica
  router-link.item(to="/", exact) Tasks
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
    router-link.item(to="/help") Help
    .menu
      router-link.item(to="/help/faq") Faq
      router-link.item(to="/help/report-bug") Report a bug
      router-link.item(to="/help/request-feature") Request a feature
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
        router-link.item(to="/logout") Logout
</template>

<style>
.ui.menu .right.menu .ui.simple.dropdown > .item::before {
  right: auto;
  left: 0;
}

#app-menu {
  background-color: #432874;
  border-bottom: 0px;
}

#app-menu .header.item {
  width: 256px;
}

#app-menu > .item, #app-menu .dropdown > .item {
  height: 56px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: bold;
  text-align: center;
  padding: 16px 20px;
  color: #fff;
}

#app-menu > .item::before, #app-menu .dropdown > .item::before {
  width: 0px;
}

#app-menu > .item:hover, #app-menu .dropdown:hover {
  background-color: #6133b4;
}

#app-menu > .item.router-link-active {
  box-shadow: 0px -4px 0px #6133b4 inset;
}

#app-menu > .dropdown > .menu {
  border: none;
}

#app-menu .dropdown .menu > .item {
  /* !important to override Semantic UI's !important */
  width: 217px;
  background: #6133b4 !important;
  color: #fff !important;
  font-size: 16px !important;
  line-height: 1.5;
  padding: 6px 0px 6px 20px !important;
}

#app-menu .dropdown .menu > .item:hover {
  background: #4f2a93 !important; /* to override Semantic UI's !important */
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