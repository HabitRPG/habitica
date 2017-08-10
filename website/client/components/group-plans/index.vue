<template lang="pug">
.row
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'groupPlanDetailTaskInformation', params: {groupId}}",
      exact, :class="{'active': $route.name === 'groupPlanDetailTaskInformation'}") Task Board
    router-link.nav-link(:to="{name: 'groupPlanDetailInformation', params: {groupId}}",
      exact, :class="{'active': $route.name === 'groupPlanDetailInformation'}") Group Information

  .col-12
    router-view
</template>

<script>
import SecondaryMenu from 'client/components/secondaryMenu';

export default {
  props: ['groupId'],
  components: {
    SecondaryMenu,
  },
};
</script>
