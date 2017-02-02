<template lang="pug">
// TODO srcset / svg images
#app-menu.ui.top.fixed.menu
  .header.item
    img(src="~assets/header/png/logo@3x.png")
  router-link.item(:to="{name: 'tasks'}", exact) 
    span(v-once) {{ $t('tasks') }}
  // .simple makes it possible to have a dropdown without JS
  .ui.simple.dropdown
    router-link.item(:to="{name: 'inventory'}", :class="{'active': $route.path.startsWith('/inventory')}") 
      span(v-once) {{ $t('inventory') }}
    .menu
      router-link.item(:to="{name: 'inventory'}") 
        span(v-once) {{ $t('inventory') }}
      router-link.item(:to="{name: 'equipment'}") 
        span(v-once) {{ $t('equipment') }}
      router-link.item(:to="{name: 'stable'}") 
        span(v-once) {{ $t('stable') }}
  router-link.item(:to="{name: 'market'}") 
    span(v-once) {{ $t('market') }}
  .ui.simple.dropdown
    router-link.item(:to="{name: 'tavern'}", :class="{'active': $route.path.startsWith('/social')}") 
      span(v-once) {{ $t('social') }}
    .menu
      router-link.item(:to="{name: 'tavern'}") 
        span(v-once) {{ $t('tavern') }}
      router-link.item(:to="{name: 'inbox'}") 
        span(v-once) {{ $t('inbox') }}
      router-link.item(:to="{name: 'challenges'}") 
        span(v-once) {{ $t('challenges') }}
      router-link.item(:to="{name: 'party'}") 
        span(v-once) {{ $t('party') }}
      router-link.item(:to="{name: 'guilds'}") 
        span(v-once) {{ $t('guilds') }}
  .ui.simple.dropdown
    router-link.item(to="/help", :class="{'active': $route.path.startsWith('/help')}") 
      span(v-once) {{ $t('help') }}
    .menu
      router-link.item(to="/help/faq") 
        span(v-once) {{ $t('faq') }}
      router-link.item(to="/help/report-bug") 
        span(v-once) {{ $t('reportBug') }}
      router-link.item(to="/help/request-feature") 
        span(v-once) {{ $t('requestAF') }}
  .right.menu
    .item.with-img
      img(src="~assets/header/png/gem@3x.png")
      span {{userGems}}
    .item.with-img.gp-icon
      img(src="~assets/header/png/gold@3x.png")
      span {{user.stats.gp | floor}}
    a.item.with-img.notifications-dropdown
      img(src="~assets/header/png/notifications@3x.png")
    .ui.simple.dropdown.pointing
      router-link.item.with-img.user-dropdown(:to="{name: 'avatar'}")
        // TODO icons should be white when active
        img(src="~assets/header/png/user@3x.png")
      .menu
        .item.user-edit-avatar
          strong {{user.profile.name}}
          a(v-once) {{ $t('editAvatar') }}
        .divider
        router-link.item(:to="{name: 'stats'}") 
          span(v-once) {{ $t('stats') }}
        router-link.item(:to="{name: 'achievements'}") 
          span(v-once) {{ $t('achievements') }}
        .divider
        router-link.item(:to="{name: 'settings'}") 
          span(v-once) {{ $t('settings') }}
        .divider
        router-link.item(to="/logout") 
          span(v-once) {{ $t('logout') }}
</template>

<style lang="less">
#app-menu {
  background: #432874 url(~assets/header/png/bits.png) right no-repeat;
  border-bottom: 0px;
  
  .item {
    font-size: 16px !important;
    line-height: 1.5;

    &.header {
      width: 256px;
      padding-left: 20px;

      img {
        width: 128px;
        height: 28px;
      }
    }
  }
}

#app-menu .item:not(.header) img {
  vertical-align: middle;
  width: 32px;
  height: 32px;
  margin: 0 auto;
}

#app-menu .right.menu .item.with-img {
  padding-left: 0px;
  padding-right: 0px;
  margin-right: 20px;
}

#app-menu .right.menu .item.with-img.user-dropdown, #app-menu .right.menu .item.with-img.notifications-dropdown{
  width: 56px;
}

#app-menu .right.menu .item.with-img.user-dropdown, #app-menu .right.menu .item.with-img.notifications-dropdown {
  width: 56px;
}

#app-menu .right.menu .item.with-img.notifications-dropdown {
  margin-right: 0px;
}

#app-menu .right.menu .item.with-img.gp-icon {
  margin-right: 40px;
}

#app-menu .right.menu .item.with-img img + span {
  margin-left: 10px;
}

#app-menu .ui.menu .right.menu .ui.simple.dropdown > .item::before {
  right: auto;
  left: 0;
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

#app-menu > .item.active, #app-menu > .dropdown > .item.active {
  box-shadow: 0px -4px 0px #6133b4 inset;
}

#app-menu > .dropdown > .menu {
  border: none;
  background-color: rgba(0, 0, 0, 0.5); // transparent
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

#app-menu .dropdown .menu .item.active {
  font-weight: normal !important;
}

#app-menu > .dropdown .menu > .item:hover {
  background: #4f2a93 !important; /* to override Semantic UI's !important */
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

#app-menu .user-edit-avatar strong, #app-menu .user-edit-avatar strong:hover {
  color: #313131;
  margin-top: -3px;
  flex-grow: 1;
  display: block;
}

#app-menu .user-edit-avatar a, #app-menu .user-edit-avatar a:hover {
  font-size: 13px;
  line-height: 1.23;
  color: #6133b4;
}
</style>

<script>
import { mapState, mapGetters } from '../store';

export default {
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState(['user']),
  },
};
</script>