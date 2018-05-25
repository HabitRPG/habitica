<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'items'}", exact) {{ $t('items') }}
    router-link.nav-link(:to="{name: 'equipment'}") {{ $t('equipment') }}
    router-link.nav-link(:to="{name: 'stable'}") {{ $t('stable') }}
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