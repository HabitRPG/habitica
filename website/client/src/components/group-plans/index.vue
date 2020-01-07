<template>
  <div class="row">
    <group-form-modal />
    <navbar
      class="secondary-menu col-12"
      :items="tabs"
      router-links
    />
    <div class="col-12">
      <router-view />
    </div>
  </div>
</template>

<script>
import GroupFormModal from '@/components/groups/groupFormModal';
import Navbar from '@/components/ui/simpleNavbar';
import { mapState } from '@/libs/store';

export default {
  components: {
    Navbar,
    GroupFormModal,
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
    tabs () {
      // groupId - unnecessary param in this case
      const tabs = [
        {
          title: 'groupTaskBoard',
          name: 'groupPlanDetailTaskInformation',
        },
        {
          title: 'groupInformation',
          name: 'groupPlanDetailInformation',
        },
      ];

      if (this.isLeader) {
        tabs.push({
          title: 'groupBilling',
          name: 'groupPlanBilling',
        });
      }

      return tabs;
    },
  },
};
</script>
