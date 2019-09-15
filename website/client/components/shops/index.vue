<template lang="pug">
  .row
    secondary-menu.col-12
      router-link.nav-link(:to="{name: 'market'}", exact) {{ $t('market') }}
      router-link.nav-link(:to="{name: 'quests'}") {{ $t('quests') }}
      router-link.nav-link(:to="{name: 'seasonal'}") {{ $t('titleSeasonalShop') }}
      router-link.nav-link(:to="{name: 'time'}") {{ $t('titleTimeTravelers') }}
    .col-12
      router-view
</template>

<script>
  import SecondaryMenu from 'client/components/secondaryMenu';

  export default {
    components: {
      SecondaryMenu,
    },
    methods: {},
  };
</script>
