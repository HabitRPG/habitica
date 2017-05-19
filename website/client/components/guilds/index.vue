<template lang="pug">
.row
  .col-12
    nav.nav.sub-nav
      .col-md-6.offset-md-4
        router-link.nav-link(:to="{name: 'tavern'}", exact, :class="{'active': $route.name === 'tavern'}") {{ $t('tavern') }}
        router-link.nav-link(:to="{name: 'myGuilds'}", :class="{'active': $route.name === 'myGuilds'}") {{ $t('myGuilds') }}
        router-link.nav-link(:to="{name: 'guildsDiscovery'}", :class="{'active': $route.name === 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
      .col-md-2
        button.btn.btn-primary.btn-purple(b-btn, @click="$root.$emit('show::modal','modal1')") {{ $t('createGuild') }}
  .col-12
    router-view

  group-form-modal
</template>

<style lang="scss" scoped>
body {
  background-color: #f9f9f9
}

.sub-nav {
  height: 56px;
  background-color: #edecee;
  box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.2);
  text-align: center;
  position: relative;
  z-index: 1;

  a {
    font-size: 16px;
    font-weight: bold;
    line-height: 1.5;
    color: #4e4a57;
    padding: 1em;
    float: left;
  }

  a.active {
    color: #6133b4;
    border-bottom: 4px solid #6133b4;
  }
}

.btn-purple {
  margin: .5em;
  border-radius: 2px;
  background-color: #4f2a93;
  box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  font-weight: bold;
}

.btn-purple:hover, .btn-purple:active {
  background-color: #4f2a93;
  box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
}
</style>

<script>
import groupFormModal from './groupFormModal';

export default {
  components: {
    groupFormModal,
  },
};
</script>
