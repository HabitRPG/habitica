<template lang="pug">
.row
  group-form-modal
  secondary-menu.col-12
    router-link.nav-link(:to="{name: 'groupPlanDetailTaskInformation', params: {groupId}}",
      exact, :class="{'active': $route.name === 'groupPlanDetailTaskInformation'}") {{ $t('groupTaskBoard') }}
    router-link.nav-link(:to="{name: 'groupPlanDetailInformation', params: {groupId}}",
      exact, :class="{'active': $route.name === 'groupPlanDetailInformation'}") {{ $t('groupInformation') }}
    router-link.nav-link(
      v-if='isLeader',
      :to="{name: 'groupPlanBilling', params: {groupId}}",
      exact,
      :class="{'active': $route.name === 'groupPlanBilling'}") {{ $t('groupBilling') }}

  .col-12
    router-view
</template>

<script>
import groupFormModal from '@/components/groups/groupFormModal';
import SecondaryMenu from '@/components/secondaryMenu';
import { mapState } from '@/libs/store';

export default {
  components: {
    SecondaryMenu,
    groupFormModal,
  },
  props: ['groupId'],
  computed: {
    ...mapState({
      user: 'user.data',
      groupPlans: 'groupPlans',
    }),
    currentGroup () {
      const groupFound = this.groupPlans.find(group => group._id === this.groupId);

      return groupFound;
    },
    isLeader () {
      if (!this.currentGroup) return false;
      return this.currentGroup.leader === this.user._id;
    },
  },
};
</script>
