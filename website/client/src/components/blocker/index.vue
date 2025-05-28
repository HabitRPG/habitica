<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="blocker-content">
      <h1>Blockers</h1>
      <table class="table">
        <thead>
          <tr>
            <th>Created at</th>
            <th>Type</th>
            <th>Area</th>
            <th>Value</th>
            <th>Reason</th>
            <th class="action-column"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="blocker in blockers"
            :key="blocker._id">
            <td>{{ blocker.created }}</td>
            <td>{{ blocker.type }}</td>
            <td>{{ blocker.area }}</td>
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
                @click="removeBlocker(blocker._id)"
              >
              <span
                  v-once
                  class="svg-icon icon-16"
                  v-html="icons.deleteIcon"
                ></span>
              </button>
            </td>
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

export default {
  data () {
    return {
      blockers: [],
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
      console.log(this.blockers);
    },
  },
};
</script>
