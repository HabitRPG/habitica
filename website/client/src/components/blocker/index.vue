<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="blocker-content">
      <h1>Blockers
      <button
        class="btn btn-primary float-right"
        @click="showCreateForm = true">Create</button></h1>
      <table class="table">
        <thead>
          <tr>
            <th>Created at</th>
            <th>Type</th>
            <th>Area</th>
            <th>Value</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="showCreateForm">
            <BlockerForm
              :is-new="true"
              :blocker="newBlocker"
              @save="createBlocker"
              @cancel="showCreateForm = false"
            />
          </tr>
          <tr
            v-for="blocker in blockers"
            :key="blocker._id">
            <BlockerForm
              v-if="blocker._id === editedBlockerId"
              :blocker="blocker"
              @save="saveBlocker(blocker)"
              @cancel="editedBlockerId = null"
            />
            <template v-else>
              <td>{{ blocker.createdAt }}</td>
              <td>{{ getTypeName(blocker.type) }}</td>
              <td>{{ getAreaName(blocker.area) }}</td>
              <td>{{ blocker.value }}</td>
              <td>{{ blocker.reason }}</td>
              <td>
                <button
                  class="btn btn-primary mr-2"
                  @click="editBlocker(blocker._id)"
                >
                <span
                    v-once
                    class="svg-icon icon-16"
                    v-html="icons.editIcon"
                  ></span>
                </button>
                <button
                  class="btn btn-danger"
                  @click="deleteBlocker(blocker._id)"
                >
                <span
                    v-once
                    class="svg-icon icon-16"
                    v-html="icons.deleteIcon"
                  ></span>
                </button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .blocker-content {
    flex: 0 0 100%;
    max-width: 1200px;
  }

  .action-column {
    width: 120px;
  }

  .btn {
    padding: 0.4rem 0.75rem;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import editIcon from '@/assets/svg/edit.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import BlockerForm from './blocker_form.vue';

export default {
  components: {
    BlockerForm,
  },
  data () {
    return {
      showCreateForm: false,
      newBlocker: {
        type: '',
        area: '',
        value: '',
        reason: '',
      },
      blockers: [],
      editedBlockerId: null,
      icons: Object.freeze({
        editIcon,
        deleteIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: 'Admin Panel',
    });
    this.loadBlockers();
  },
  methods: {
    async loadBlockers () {
      this.blockers = await this.$store.dispatch('blockers:getBlockers');
    },
    editBlocker (id) {
      this.editedBlockerId = id;
    },
    async saveBlocker (blocker) {
      await this.$store.dispatch('blockers:updateBlocker', { blocker });
      this.editedBlockerId = null;
      this.loadBlockers();
    },
    async deleteBlocker (blockerId) {
      if (!window.confirm('Are you sure you want to delete this blocker?')) {
        return;
      }
      await this.$store.dispatch('blockers:deleteBlocker', { blockerId });
      this.loadBlockers();
    },
    async createBlocker (blocker) {
      await this.$store.dispatch('blockers:createBlocker', { blocker });
      this.showCreateForm = false;
      this.loadBlockers();
    },

    getTypeName (type) {
      switch (type) {
        case 'ipaddress':
          return 'IP Address';
        case 'email':
          return 'E-Mail';
        default:
          return type;
      }
    },
    getAreaName (area) {
      switch (area) {
        case 'full':
          return 'Full';
        case 'payments':
          return 'Payments';
        default:
          return area;
      }
    },
  },
};
</script>
