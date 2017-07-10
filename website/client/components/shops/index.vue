<template lang="pug">
  .row
    secondary-menu.col-12
      router-link.nav-link(:to="{name: 'market'}", exact) {{ $t('market') }}
      router-link.nav-link(:to="{name: 'quests'}") {{ $t('quests') }}
      router-link.nav-link(:to="{name: 'seasonal'}") {{ $t('titleSeasonalShop') }}
      router-link.nav-link(:to="{name: 'time'}") {{ $t('titleTimeTravelers') }}
    .col-12
      router-view

    div {{ market }}
</template>

<script>
  import {mapState} from 'client/libs/store';

  import SecondaryMenu from 'client/components/secondaryMenu';

  export default {
    components: {
      SecondaryMenu,
    },
    computed: {
      ...mapState({
        market: 'shops.market.data',
      }),
    },
    created () {
      this.$store.dispatch('shops:fetch');
    },
  };
</script>
