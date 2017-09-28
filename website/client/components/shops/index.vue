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
  import notifications from 'client/mixins/notifications';

  export default {
    mixins: [notifications],
    components: {
      SecondaryMenu,
    },
    methods: {
      showUnpinNotification (item) {
        this.text(this.$t('unpinnedItem', {item: item.text}));
      },
    },
  };
</script>
