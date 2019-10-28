<template>
  <b-modal
    id="approval-modal"
    :title="$t('approveTask')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <div
        v-for="(approval, index) in task.approvals"
        class="row approval"
      >
        <div class="col-8">
          <strong>{{ approval.userId.profile.name }}</strong>
        </div>
        <div class="col-2">
          <button
            class="btn btn-primary"
            @click="approve(index)"
          >
            {{ $t('approve') }}
          </button>
        </div>
        <div class="col-2">
          <button
            class="btn btn-secondary"
            @click="needsWork(index)"
          >
            {{ $t('needsWork') }}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        @click="close()"
      >
        {{ $t('close') }}
      </button>
    </div>
  </b-modal>
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
      const userIdToApprove = this.task.group.assignedUsers[index];
      this.$store.dispatch('tasks:approve', {
        taskId: this.task._id,
        userId: userIdToApprove,
      });
      this.task.group.assignedUsers.splice(index, 1);
      this.task.approvals.splice(index, 1);
    },
    needsWork (index) {
      if (!window.confirm(this.$t('confirmNeedsWork'))) return;
      const userIdNeedsMoreWork = this.task.group.assignedUsers[index];
      this.$store.dispatch('tasks:needsWork', {
        taskId: this.task._id,
        userId: userIdNeedsMoreWork,
      });
      this.task.approvals.splice(index, 1);
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'approval-modal');
    },
  },
};
</script>
