<template>
  <b-modal
    id="remove-member"
    :title="$t('removeMember')"
    size="md"
    :hide-footer="true"
  >
    <div class="text-center">
      <h2 class="col-12">
        {{ $t('sureKick') }}
      </h2>
      <div
        v-if="memberToRemove.profile"
        class="col-12 removing-member"
      >
        {{ memberToRemove.profile.name }}
      </div>
    </div>
    <div class="modal-body">
      <textarea
        v-model="removeMessage"
        class="form-control"
        type="text"
        rows="5"
        :placeholder="$t('optionalMessage')"
      ></textarea>
    </div>
    <div class="modal-footer">
      <button
        class="pull-left btn btn-danger"
        @click="confirmRemoveMember()"
      >
        {{ $t('yesRemove') }}
      </button>
      <button
        class="btn btn-secondary"
        @click="close()"
      >
        {{ $t('cancel') }}
      </button>
    </div>
  </b-modal>
</template>

<style scoped>
  .removing-member {
    color: #878190;
    margin-bottom: .5em;
  }
</style>

<script>
export default {
  props: ['memberToRemove', 'groupId'],
  data () {
    return {
      removeMessage: '',
    };
  },
  methods: {
    async confirmRemoveMember () {
      await this.$store.dispatch('members:removeMember', {
        memberId: this.memberToRemove._id,
        groupId: this.groupId,
        message: this.removeMessage,
      });

      this.removeMessage = '';
      this.$emit('member-removed', this.memberToRemove);
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'remove-member');
    },
  },
};
</script>
