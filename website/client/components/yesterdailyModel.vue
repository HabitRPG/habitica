<template lang="pug">
  b-modal#yesterdaily(:title="$t('armoireText')", size='lg', :hide-footer="true")
    .modal-header
      .shop_armoire.pull-right
    .modal-body
      task-column.col-6.offset-3(
        v-if='tasksByType && tasksByType[column]'
        v-for="column in ['daily']",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]',
        :isUser='true')
    .modal-footer.text-center
      button.btn.btn-primary(@click='close()') Start My Day
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import bModal from 'bootstrap-vue/lib/components/modal';
import Column from './tasks/column';

export default {
  props: ['yesterDailies'],
  components: {
    bModal,
    TaskColumn: Column,
  },
  computed: {
    ...mapState({user: 'user.data'}),
    tasksByType () {
      return {
        daily: this.yesterDailies,
      };
    },
  },
  methods: {
    async close () {
      await axios.post('/api/v3/cron');
      // @TODO: Better way to sync user?
      window.location.href = '/';
      this.$root.$emit('hide::modal', 'yesterdaily');
    },
  },
};
</script>
