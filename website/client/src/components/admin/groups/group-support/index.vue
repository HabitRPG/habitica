<template>
  <div v-if="hasPermission(user, 'groupSupport')">
    <h2>{{ group.name }}</h2>
    <supportContainer
      :title="$t('groupData')"
    >
      <groupData
        :group="group"
      />
    </supportContainer>
    <supportContainer
      :title="$t('groupPlanSubscription')"
    />
    <supportContainer
      v-if="group.type === 'party'"
      :title="$t('questDetails')"
    />
    <supportContainer
      :title="$t('members')"
    >
      <members
        :group="group"
      />
    </supportContainer>
  </div>
</template>

<script>
import { userStateMixin } from '../../../../mixins/userState';
import supportContainer from '../../supportContainer.vue';
import groupData from './groupData.vue';
import members from './members.vue';

export default {
  components: {
    supportContainer,
    groupData,
    members,
  },
  mixins: [userStateMixin],
  data () {
    return {
      groupId: '',
      group: {},
    };
  },
  watch: {
    groupId () {
      this.loadGroup(this.groupId);
    },
  },
  mounted () {
    this.groupId = this.$route.params.groupId;
  },
  methods: {
    clearData () {
      this.group = {};
    },
    async loadGroup (groupId) {
      this.$emit('changeGroupId', groupId);
      this.group = await this.$store.dispatch('admin:getGroup', { groupId });
    },
    async updateGroup () {
      await this.$store.dispatch('admin:updateGroup', { group: this.group });
      this.$emit('groupSaved', this.group);
    },
  },
};
</script>
