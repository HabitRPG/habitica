<template lang="pug">
// TODO srcset / svg images
#app-menu.ui.top.fixed.menu
  .header.item
    img(src="~assets/header/png/logo@3x.png")
  router-link.item(to="/", exact) Tasks
  // .simple makes it possible to have a dropdown without JS
  .ui.simple.dropdown
    router-link.item(to="/inventory", :class="{'router-link-active': $route.path.startsWith('/inventory')}") Inventory
    .menu
      router-link.item(to="/inventory") Inventory
      router-link.item(to="/inventory/stable") Stable
      router-link.item(to="/inventory/equipment") Equipment
  router-link.item(to="/market") Market
  .ui.simple.dropdown
    router-link.item(to="/social/tavern", :class="{'router-link-active': $route.path.startsWith('/social')}") Social
    .menu
      router-link.item(to="/social/tavern") Tavern
      router-link.item(to="/social/inbox") Inbox
      router-link.item(to="/social/challenges") Challenges
      router-link.item(to="/social/party") Party
      router-link.item(to="/social/guilds") Guilds
  .ui.simple.dropdown
    router-link.item(to="/help", :class="{'router-link-active': $route.path.startsWith('/help')}") Help
    .menu
      router-link.item(to="/help/faq") Faq
      router-link.item(to="/help/report-bug") Report a bug
      router-link.item(to="/help/request-feature") Request a feature
  .right.menu
    .item.with-img
      img(src="~assets/header/png/gem@3x.png")
      span {{userGems}}
    .item.with-img.gp-icon
      img(src="~assets/header/png/gold@3x.png")
      span {{Math.floor(user.stats.gp * 100) / 100}}
    a.item.with-img
      img(src="~assets/header/png/notifications@3x.png")
    .ui.simple.dropdown.pointing
      router-link.item.with-img(to="/user/avatar")
        // TODO icons should be white when active
        img(src="~assets/header/png/user@3x.png")
      .menu
        .item.small-avatar-container
          .small-avatar
          .small-avatar-links
            strong {{user.profile.name}}
            a Edit avatar
        .divider
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
  background: #432874 url(~assets/header/png/bits.png) right no-repeat;
  border-bottom: 0px;
}

#app-menu .item {
  font-size: 16px !important;
  line-height: 1.5;
}

#app-menu .header.item {
  width: 256px;
  padding-left: 20px;
}

#app-menu .header.item img {
  width: 128px;
  height: 28px;
}

#app-menu .item:not(.header) img {
  vertical-align: middle;
  width: 32px;
  height: 32px;
}

#app-menu .right.menu .item.with-img {
  padding-left: 0px;
  padding-right: 0px;
  margin-right: 20px;
}

#app-menu .right.menu .item.with-img.gp-icon {
  margin-right: 40px;
}

#app-menu .right.menu .item.with-img img + span {
  margin-left: 10px;
}

#app-menu > .item, #app-menu > .right.menu > .item, #app-menu .dropdown > .item {
  height: 56px;
  font-weight: bold;
  text-align: center;
  padding: 16px 20px;
  color: #fff;
}

#app-menu > .item::before, #app-menu > .right.menu > .item::before, #app-menu .dropdown > .item::before {
  width: 0px;
}

#app-menu > .item:not(.header):hover, #app-menu > .dropdown:hover {
  background-color: #6133b4;
}

#app-menu > .item.router-link-active, #app-menu > .dropdown > .item.router-link-active {
  box-shadow: 0px -4px 0px #6133b4 inset;
}

#app-menu > .dropdown > .menu {
  border: none;
}

#app-menu > .dropdown > .menu > .item:last-child {
  border-radius: 0px 0px 4px 4px !important;
}

#app-menu > .dropdown .menu > .item {
  /* !important to override Semantic UI's !important */
  width: 217px;
  background: #6133b4 !important;
  color: #fff !important;
  padding: 6px 0px 6px 20px !important;
}

#app-menu > .dropdown .menu > .item:hover {
  background: #4f2a93 !important; /* to override Semantic UI's !important */
}

#app-menu .ui.pointing.dropdown > .item {
  margin-right: 32px;
}

#app-menu .ui.pointing.dropdown .menu .item {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  color: #616162 !important;
}

#app-menu .ui.pointing.dropdown .menu .item {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  color: #616162 !important;
}

#app-menu .ui.pointing.dropdown .menu .item:nth-child(3) {
  padding-bottom: 8px !important;
}

#app-menu .ui.pointing.dropdown .menu .item:nth-child(4) {
  padding-top: 8px !important;
}

#app-menu .ui.pointing.dropdown .menu {
  width: 200px;
  margin-right: 20px;
  margin-top: 0px;
}

#app-menu .ui.pointing.dropdown .menu .item:hover {
  background: #fff !important;
  color: #6133b4 !important;
}

#app-menu .ui.pointing.dropdown > .menu::after {
  top: -0.50em;
  left: 85.3%;
  width: 1em;
  height: 1em;
}

#app-menu .ui.pointing.dropdown .divider {
  margin: 0px;
}

#app-menu .small-avatar-container {
  display: flex;
}

#app-menu .small-avatar-links {
  display: flex;
  flex-direction: column;
}

#app-menu .small-avatar-links strong, #app-menu .small-avatar-links strong:hover {
  color: #313131;
}

#app-menu .small-avatar-container strong {
  margin-top: -3px;
  flex-grow: 1;
}

#app-menu .small-avatar-container a {
  font-size: 13px;
  line-height: 1.23;
  color: #6133b4;
}

#app-menu .small-avatar-container a:hover {
  color: #6133b4;
}

#app-menu .small-avatar {
  width: 34.5px;
  height: 34.5px;
  background: black;
  margin-right: 10.5px;
}
</style>

<script>
import { mapState, mapGetters } from '../store';
import Avatar from './avatar';

export default {
  components: {
    Avatar, // todo
  },
  computed: {
    ...mapGetters(['userGems']),
    ...mapState(['user']),
  },
};
</script>