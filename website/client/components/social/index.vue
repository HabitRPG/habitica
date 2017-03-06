<template lang="pug">
.row
  .col-12
    nav.nav
      router-link.nav-link(:to="{name: 'tavern'}", exact) {{ $t('tavern') }}
      router-link.nav-link(:to="{name: 'inbox'}") {{ $t('inbox') }}
      router-link.nav-link(:to="{name: 'guildsDiscovery'}") {{ $t('guilds') }}
  .col-12
    router-view
</template>

<script>
export default {};
</script>