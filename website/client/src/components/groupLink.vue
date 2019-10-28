<template>
  <b-link
    v-if="group"
    @click.prevent="goToGroup"
  >
    {{ group.name }}
  </b-link>
</template>

<script>
import { TAVERN_ID } from '@/../../common/script/constants';

export default {
  props: ['group'],
  methods: {
    goToGroup () {
      if (this.group.type === 'party') {
        this.$router.push({ name: 'party' });
      } else if (this.group._id === TAVERN_ID) {
        this.$router.push({ name: 'tavern' });
      } else {
        this.$router.push({ name: 'guild', params: { groupId: this.group._id } });
      }
    },
  },
};
</script>
