<template>
  <div class="row">
    <navbar
      class="secondary-menu col-12"
      :items="tabs"
      router-links
    />
    <div class="col-12">
      <router-view />
    </div>
    <group-form-modal />
  </div>
</template>

<script>
import GroupFormModal from './groupFormModal';
import Navbar from '@/components/ui/simpleNavbar';

export default {
  components: {
    GroupFormModal,
    Navbar,
  },
  computed: {
    tabs () {
      // get tabs from routes?
      return [
        {
          title: 'tavern',
          name: 'tavern',
        },
        {
          title: 'myGuilds',
          name: 'myGuilds',
        },
        {
          title: 'guildsDiscovery',
          name: 'guildsDiscovery',
        },
      ];
    },
  },
};
</script>
