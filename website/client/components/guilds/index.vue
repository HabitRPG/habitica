<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'tavern'}", exact, :class="{'active': $route.name === 'tavern'}") {{ $t('tavern') }}
    router-link.nav-link(:to="{name: 'myGuilds'}", :class="{'active': $route.name === 'myGuilds'}") {{ $t('myGuilds') }}
    router-link.nav-link(:to="{name: 'guildsDiscovery'}", :class="{'active': $route.name === 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}

  .col-12
    router-view

  group-form-modal
</template>
<!-- .col-md-2
  button.btn.btn-primary(b-btn, @click="$root.$emit('show::modal','guild-form')") {{ $t('createGuild') }} -->

<script>
import groupFormModal from './groupFormModal';
import SecondaryMenu from 'client/components/secondaryMenu';

export default {
  components: {
    groupFormModal,
    SecondaryMenu,
  },
};
</script>
