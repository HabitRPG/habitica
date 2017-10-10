<template lang="pug">
  b-modal#approval-modal(title="Approve Task", size='md', :hide-footer="true")
    .modal-body
      .row.approval(v-for='(approval, index) in task.approvals')
        .col-8
          strong {{approval.userId.profile.name}}
        .col-2
          button.btn.btn-primary(@click='approve(index)') Approve
    .modal-footer
      button.btn.btn-secondary(@click='close()') {{$t('close')}}
</template>

<style scoped>
  .row.approval {
    padding-top: 1em;
    padding-bottom: 1em;
  }
</style>

<script>
export default {
  props: ['task'],
  methods: {
    approve (index) {
      if (!confirm('Are you sure you want to approve this task?')) return;
      let userIdToApprove = this.task.group.assignedUsers[index];
      this.$store.dispatch('tasks:unassignTask', {
        taskId: this.task._id,
        userId: userIdToApprove,
      });
      this.task.group.assignedUsers.splice(index, 1);
      this.task.approvals.splice(index, 1);
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'approval-modal');
    },
  },
};
</script>
