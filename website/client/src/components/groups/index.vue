<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'tavern'}"
        exact="exact"
        :class="{'active': $route.name === 'tavern'}"
      >
        {{ $t('tavern') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'myGuilds'}"
        :class="{'active': $route.name === 'myGuilds'}"
      >
        {{ $t('myGuilds') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'guildsDiscovery'}"
        :class="{'active': $route.name === 'guildsDiscovery'}"
      >
        {{ $t('guildsDiscovery') }}
      </router-link>
    </secondary-menu>
    <div class="col-12">
      <router-view />
    </div>
    <group-form-modal />
  </div>
</template>

<script>
import groupFormModal from './groupFormModal';
import SecondaryMenu from '@/components/secondaryMenu';

export default {
  components: {
    groupFormModal,
    SecondaryMenu,
  },
};
</script>
