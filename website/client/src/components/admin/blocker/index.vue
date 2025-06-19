<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="blocker-content">
      <h1>
        Blockers
        <button
          class="btn btn-primary float-right"
          @click="showCreateForm = true"
        >
          Create
        </button>
      </h1>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>
              Type <span
                id="type_tooltip"
                class="info-icon"
              >?</span>
              <b-tooltip
                target="type_tooltip"
              >
                <b>IP-Address</b> - Block access for a specific IP-Address
                <br>
                <br>
                <b>Client</b> - Block access for a client based on the "x-client" header.
                <br>
                <br>
                <b>E-Mail</b> - Blocks e-mails from being used for signup.
              </b-tooltip>
            </th>
            <th>
              Area <span
                id="area_tooltip"
                class="info-icon"
              >?</span>
              <b-tooltip
                target="area_tooltip"
              >
                <b>Full</b> - Block access to the entire site.
                <br>
                <br>
                <b>Payments</b> - Block access to any payment related functionality.
              </b-tooltip>
            </th>
            <th>Value</th>
            <th>Reason</th>
            <th>Source</th>
            <th>Created at</th>
            <th class="btncol"></th>
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
            :key="blocker._id"
          >
            <BlockerForm
              v-if="blocker._id === editedBlockerId"
              :blocker="blocker"
              @save="saveBlocker(blocker)"
              @cancel="editedBlockerId = null"
            />
            <template v-else>
              <td>{{ getTypeName(blocker.type) }}</td>
              <td>{{ getAreaName(blocker.area) }}</td>
              <td>{{ blocker.value }}</td>
              <td>{{ blocker.reason || "--" }}</td>
              <td>{{ blocker.blockSource }}</td>
              <td>{{ blocker.createdAt }}</td>
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
@import '@/assets/scss/colors.scss';

  .blocker-content {
    flex: 0 0 100%;
    max-width: 1200px;
  }

  .btn {
    padding: 0.4rem 0.75rem;
  }

  .btncol {
    width: 123px;
  }

  td {
    font-size: 1rem;
  }

  .info-icon {
    font-size: 0.8rem;
    color: $purple-400;
    cursor: pointer;
    margin-left: 0.5rem;
    background-color: $gray-500;
    padding: 0.1rem 0.3rem;
    border-radius: 0.2rem;
  }

  .info-icon:hover {
    background-color: $purple-400;
    color: white;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import editIcon from '@/assets/svg/edit.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
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
        area: 'full',
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
      section: this.$t('siteBlockers'),
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
      this.newBlocker = {
        type: '',
        area: 'full',
        value: '',
        reason: '',
      };
      this.loadBlockers();
    },

    getTypeName (type) {
      switch (type) {
        case 'ipaddress':
          return 'IP-Address';
        case 'email':
          return 'E-Mail';
        case 'client':
          return 'Client Identifier';
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
