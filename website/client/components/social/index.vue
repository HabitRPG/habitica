<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'tavern'}", exact) {{ $t('tavern') }}
    router-link.nav-link(:to="{name: 'inbox'}") {{ $t('inbox') }}
    router-link.nav-link(:to="{name: 'guildsDiscovery'}") {{ $t('guilds') }}
  .col-12
    router-view
</template>

<script>
import SecondaryMenu from 'client/components/secondaryMenu';

export default {
  components: {
    SecondaryMenu,
  },
};
</script>