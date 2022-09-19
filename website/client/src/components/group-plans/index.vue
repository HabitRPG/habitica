<template>
  <div class="row">
    <group-form-modal />
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'groupPlanDetailTaskInformation', params: {groupId}}"
        exact="exact"
        :class="{'active': $route.name === 'groupPlanDetailTaskInformation'}"
      >
        {{ $t('groupTaskBoard') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'groupPlanDetailInformation', params: {groupId}}"
        exact="exact"
        :class="{'active': $route.name === 'groupPlanDetailInformation'}"
      >
        {{ $t('groupInformation') }}
      </router-link>
      <router-link
        v-if="isLeader"
        class="nav-link"
        :to="{name: 'groupPlanBilling', params: {groupId}}"
        exact="exact"
        :class="{'active': $route.name === 'groupPlanBilling'}"
      >
        {{ $t('groupBilling') }}
      </router-link>
    </secondary-menu>
    <div class="col-12 px-0">
      <router-view />
    </div>
  </div>
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
      groupPlans: 'groupPlans.data',
    }),
    currentGroup () {
      const groupFound = this.groupPlans
        && this.groupPlans.find(group => group._id === this.groupId);

      return groupFound;
    },
    isLeader () {
      if (!this.currentGroup) return false;
      return this.currentGroup.leader === this.user._id;
    },
  },
};
</script>
