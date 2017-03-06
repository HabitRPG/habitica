<template lang="pug">
.row
  .col-12
    nav.nav
      router-link.nav-link(:to="{name: 'tavern'}", exact) {{ $t('tavern') }}
      router-link.nav-link(:to="{name: 'inbox'}") {{ $t('inbox') }}
      router-link.nav-link(:to="{name: 'guildsDiscovery'}") {{ $t('guilds') }}
  router-view.col-12
</template>

<script>
export default {};
</script>