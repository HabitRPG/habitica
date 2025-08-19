<template>
  <form-row
    :label="$t('groupLeader')"
  >
    <strong class="col-form-label">
      <router-link
        :to="{'name': 'adminPanelUser', 'params': {'userIdentifier': group.leader }}"
      >
        {{ group.leader }}
      </router-link>
    </strong>
  </form-row>
</template>

<script>
import formRow from '@/components/admin/formRow.vue';

export default {
  components: {
    formRow,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
};
</script>
