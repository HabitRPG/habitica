<template>
  <router-link
    v-if="group"
    :to="toPath"
  >
    {{ group.name }}
  </router-link>
</template>

<script>
import { TAVERN_ID } from '@/../../common/script/constants';

export default {
  props: ['group'],
  computed: {
    toPath () {
      if (this.group._id === TAVERN_ID) {
        return {
          name: 'tavern',
        };
      }

      if (this.group.type === 'party') {
        return {
          name: 'party',
        };
      }

      return {
        name: 'guild',
        params: {
          groupId: this.group._id,
        },
      };
    },
  },
};
</script>
