<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'contributors'}", exact, :class="{'active': $route.name === 'contributors'}") {{ $t('hallContributors') }}
    router-link.nav-link(:to="{name: 'patrons'}", :class="{'active': $route.name === 'patrons'}") {{ $t('hallPatrons') }}

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
