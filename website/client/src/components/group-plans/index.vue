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
    <div
      class="row beta-banner d-flex justify-content-center align-items-center"
    >
      <img src="~@/assets/images/bug.png" class="mr-2">
      <strong
        class="mr-1"
      >
        Thank you for being a Habitica beta tester!
      </strong>
      <a href="mailto:testing@habitica.com">Submit bugs and feedback to testing@habitica.com.</a>
    </div>
    <div class="col-12 px-0">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .beta-banner {
    background-color: rgba($purple-600, 0.25);
    border: solid 1px $purple-500;
    color: $purple-300;
    height: 2rem;
    width: 101%;

    a {
      color: $purple-300;
      text-decoration: underline;
    }
  }
</style>

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
