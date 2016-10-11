<template lang="pug">
#app-header.ui.top.fixed.menu
  .header.item Habitica
  router-link.item(to='/') Tasks
  // .simple makes it possible to have a dropdown without JS
  .ui.simple.dropdown.item
    | Inventory
    .menu
      router-link.item(to='/') Inventory
      router-link.item(to='/') Stable
      router-link.item(to='/') Equipment
  router-link.item(to='/market') Market
  .ui.simple.dropdown.item
    | Social
    .menu
      router-link.item(to='/') Tavern
      router-link.item(to='/') Inbox
      router-link.item(to='/') Challenges
      router-link.item(to='/') Party
      router-link.item(to='/') Guilds
  .ui.simple.dropdown.item
    | Help
    .menu
      router-link.item(to='/') Faq
      router-link.item(to='/') Report a bug
      router-link.item(to='/') Request a feature
  .ui.simple.dropdown.item
    | User
    .menu
      router-link.item(to='/') Avatar
      router-link.item(to='/') Stats
      router-link.item(to='/') Achievements
      .divider
      router-link.item(to='/') Settings
      router-link.item(to='/') Logout
</template>

<script>
import { mapState } from '../store';

export default {
  computed: mapState(['title']),
};
</script>