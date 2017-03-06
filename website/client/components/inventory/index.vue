<template lang="pug">
.row
  .col-12
    nav.nav
      router-link.nav-link(:to="{name: 'inventory'}", exact) {{ $t('inventory') }}
      router-link.nav-link(:to="{name: 'equipment'}") {{ $t('equipment') }}
      router-link.nav-link(:to="{name: 'stable'}") {{ $t('stable') }}
  router-view.col-12
</template>

<script>
export default {};
</script>